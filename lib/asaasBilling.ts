/**
 * Lógica compartilhada: criar customer + assinatura no Asaas.
 * Usado no signup (cobrança no ato) e na rota de assinatura (renovação/gerar cobrança).
 * Cartão: criamos assinatura sem dados do cartão; Asaas devolve invoiceUrl e o usuário paga na página deles (PCI-safe).
 */
import { prisma } from '@/lib/prisma';
import { getPlanBySlugOrFallback } from '@/lib/planService';
import {
  asaasCreateCustomer,
  asaasCreateSubscription,
  asaasListSubscriptionPayments,
  AsaasBillingType,
  AsaasCycle,
  AsaasError,
} from '@/lib/asaas';

export type { AsaasBillingType, AsaasCycle };

export function onlyDigits(s: string | null | undefined): string | undefined {
  if (s == null || typeof s !== 'string') return undefined;
  const d = s.replace(/\D/g, '');
  return d.length > 0 ? d : undefined;
}

/**
 * Normaliza telefone para formato Asaas (apenas DDD + número, 10 ou 11 dígitos).
 * Remove prefixo do país (55) quando vier em formato internacional.
 */
export function normalizePhoneForAsaas(s: string | null | undefined): string | undefined {
  const digits = onlyDigits(s);
  if (!digits) return undefined;

  // Ex.: +55 11 99999-9999 -> 5511999999999 -> 11999999999
  const withoutCountry =
    digits.length >= 12 && digits.startsWith('55') ? digits.slice(2) : digits;

  if (withoutCountry.length === 10 || withoutCountry.length === 11) {
    return withoutCountry;
  }

  return undefined;
}

export function cycleFromPeriod(period: string): AsaasCycle {
  const p = (period || '').toLowerCase();
  if (p === 'yearly' || p === 'annual' || p === 'anual') return 'YEARLY';
  if (p === 'semiannually' || p === '6m' || p === '6months' || p === 'semestral') return 'SEMIANNUALLY';
  return 'MONTHLY';
}

export function billingTypeFromInput(v: string): AsaasBillingType {
  const x = (v || '').toUpperCase();
  if (x === 'PIX') return 'PIX';
  if (x === 'CREDIT_CARD') return 'CREDIT_CARD';
  return 'BOLETO';
}

function yyyyMmDd(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export type CreateBillingInput = {
  companyId: string;
  billingType: AsaasBillingType;
  period: string; // monthly | semiannually | yearly
};

export type CreateBillingResult = {
  success: true;
  subscriptionId: string;
  paymentLink: string | null;
  payment: { id: string; status: string; dueDate: string } | null;
  alreadyExists?: boolean;
};

export type CreateBillingError = { success: false; error: string; status: number };

const billingInFlight = new Set<string>();

/**
 * Cria ou reutiliza customer no Asaas, cria assinatura e retorna o link de pagamento.
 * Para cartão: não enviamos dados do cartão; Asaas devolve invoiceUrl onde o usuário paga (seguro).
 */
export async function createBillingForCompany(
  input: CreateBillingInput
): Promise<CreateBillingResult | CreateBillingError> {
  if (billingInFlight.has(input.companyId)) {
    return {
      success: false,
      error: 'Já existe uma cobrança sendo processada para esta empresa. Tente novamente em instantes.',
      status: 409,
    };
  }
  billingInFlight.add(input.companyId);
  try {
  const company = await prisma.company.findUnique({
    where: { id: input.companyId },
    include: { users: true },
  });
    if (!company) {
      return { success: false, error: 'Empresa não encontrada', status: 404 };
    }
  if (company.billingSubscriptionId) {
    const payments = await asaasListSubscriptionPayments(company.billingSubscriptionId).catch(() => ({
      data: [] as any[],
    }));
    const pending = payments.data?.find(
      (p: any) => p.status === 'PENDING' || p.status === 'AWAITING_RISK_ANALYSIS'
    );
    const first = payments.data?.[0] ?? null;
    return {
      success: true,
      subscriptionId: company.billingSubscriptionId,
      paymentLink: pending?.invoiceUrl ?? pending?.bankSlipUrl ?? first?.invoiceUrl ?? first?.bankSlipUrl ?? null,
      payment: first ? { id: first.id, status: first.status, dueDate: first.dueDate } : null,
      alreadyExists: true,
    };
  }

    const planData = await getPlanBySlugOrFallback(company.plan);
  const cycle = cycleFromPeriod(input.period);
  const base = planData.price ?? 0;
  const value = cycle === 'YEARLY' ? base * 12 : cycle === 'SEMIANNUALLY' ? base * 6 : base;
  const owner = company.users.find((u) => u.role === 'owner') || company.users[0];

  let customerId = company.billingCustomerId;
  if (!customerId) {
    const cpfCnpj = onlyDigits(company.cnpj) || undefined;
    const phone = normalizePhoneForAsaas(owner?.phone ?? undefined);
    if (!cpfCnpj || (cpfCnpj.length !== 11 && cpfCnpj.length !== 14)) {
      return {
        success: false,
        error: 'CNPJ/CPF da empresa inválido. Necessário 11 (CPF) ou 14 (CNPJ) dígitos.',
        status: 400,
      };
    }
    try {
      const customer = await asaasCreateCustomer({
        name: company.name,
        cpfCnpj,
        email: owner?.email?.trim() || undefined,
        phone: phone || undefined,
        mobilePhone: phone || undefined,
      });
      customerId = customer.id;
      await prisma.company.update({
        where: { id: company.id },
        data: { billingProvider: 'asaas', billingCustomerId: customerId },
      });
    } catch (err) {
      if (err instanceof AsaasError && err.details && typeof err.details === 'object' && 'errors' in err.details) {
        const errors = (err.details as { errors?: Array<{ code?: string; description?: string }> }).errors || [];
        const msg = errors.map((e) => e.description || e.code).filter(Boolean).join('; ') || err.message;
        return { success: false, error: `Asaas: ${msg}`, status: 400 };
      }
      throw err;
    }
  }

  const next = new Date();
  next.setDate(next.getDate() + 1);

    try {
    const subscription = await asaasCreateSubscription({
      customer: customerId,
      billingType: input.billingType,
      nextDueDate: yyyyMmDd(next),
      value,
      cycle,
      description: `JADA - ${planData.name} (${cycle})`,
      externalReference: company.id,
    });

    await prisma.company.update({
      where: { id: company.id },
      data: {
        billingProvider: 'asaas',
        billingStatus: 'pending',
        billingCycle: cycle,
        billingSubscriptionId: subscription.id,
        billingNextDueDate: next,
        billingLastEventAt: new Date(),
        billingLastPayload: subscription as unknown as object,
      },
    });

    const payments = await asaasListSubscriptionPayments(subscription.id).catch(() => ({ data: [] as any[] }));
    const first = payments.data?.[0] ?? null;
    const paymentLink = first?.invoiceUrl ?? first?.bankSlipUrl ?? null;

    return {
      success: true,
      subscriptionId: subscription.id,
      paymentLink,
      payment: first ? { id: first.id, status: first.status, dueDate: first.dueDate } : null,
    };
    } catch (err) {
    if (err instanceof AsaasError && err.details && typeof err.details === 'object' && 'errors' in err.details) {
      const errors = (err.details as { errors?: Array<{ code?: string; description?: string }> }).errors || [];
      const msg = errors.map((e) => e.description || e.code).filter(Boolean).join('; ') || err.message;
      return { success: false, error: `Asaas: ${msg}`, status: 400 };
    }
      throw err;
    }
  } finally {
    billingInFlight.delete(input.companyId);
  }
}
