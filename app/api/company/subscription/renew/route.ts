import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { resolveBillingAccess, isRenewalWindowOpen } from '@/lib/billingAccess';
import { getPlanBySlugOrFallback, planSlugExistsAndActive } from '@/lib/planService';
import { billingTypeFromInput, cycleFromPeriod } from '@/lib/asaasBilling';
import { asaasUpdateSubscription, asaasListSubscriptionPayments } from '@/lib/asaas';
import { getRequestRateKey, rateLimitByKey } from '@/lib/rateLimit';
import { enforceSameOrigin, withNoStore } from '@/lib/apiSecurity';
import { resolveTenantAccess } from '@/lib/sessionContext';

function pickPaymentLink(
  payments: { data?: Array<{ status: string; invoiceUrl?: string; bankSlipUrl?: string }> } | null
): string | null {
  const list = payments?.data ?? [];
  const pending = list.find((p) => p.status === 'PENDING' || p.status === 'AWAITING_RISK_ANALYSIS');
  if (pending?.invoiceUrl || pending?.bankSlipUrl) {
    return pending.invoiceUrl ?? pending.bankSlipUrl ?? null;
  }
  const first = list[0];
  return first?.invoiceUrl ?? first?.bankSlipUrl ?? null;
}

export async function POST(request: Request) {
  const sameOriginError = enforceSameOrigin(request);
  if (sameOriginError) return sameOriginError;

  const session = await getServerSession(authOptions);
  const tenant = await resolveTenantAccess(session);
  if (!tenant.ok) {
    return NextResponse.json({ error: tenant.error }, { status: tenant.status });
  }

  const limiter = rateLimitByKey(`sub-renew:${getRequestRateKey(request)}`, 10, 60_000);
  if (!limiter.allowed) {
    return NextResponse.json({ error: 'Muitas tentativas. Aguarde um instante.' }, { status: 429 });
  }

  const company = await prisma.company.findUnique({
    where: { id: tenant.companyId },
    select: {
      id: true,
      approvalStatus: true,
      billingStatus: true,
      billingManuallyApproved: true,
      billingSubscriptionId: true,
      billingNextDueDate: true,
    },
  });
  if (!company) {
    return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 });
  }

  const userCount = await prisma.user.count({
    where: { companyId: company.id, deletedAt: null },
  });

  const access = resolveBillingAccess({
    approvalStatus: company.approvalStatus,
    billingStatus: company.billingStatus,
    billingManuallyApproved: company.billingManuallyApproved,
    billingSubscriptionId: company.billingSubscriptionId,
    billingNextDueDate: company.billingNextDueDate,
  });

  if (!isRenewalWindowOpen(access)) {
    return NextResponse.json(
      {
        error:
          'Renovação ou troca de plano só está disponível na janela de tolerância de pagamento ou nos dias que antecedem o próximo vencimento.',
      },
      { status: 403 }
    );
  }

  const subId = company.billingSubscriptionId?.trim();
  if (!subId) {
    return NextResponse.json(
      { error: 'Assinatura ainda não foi criada no provedor. Aguarde a emissão pela plataforma.' },
      { status: 400 }
    );
  }

  const body = await request.json().catch(() => ({} as Record<string, unknown>));
  const planSlug = typeof body.planSlug === 'string' ? body.planSlug.trim() : '';
  const periodRaw = typeof body.period === 'string' ? body.period : 'monthly';
  const period =
    periodRaw === 'semiannually' || periodRaw === 'yearly' ? periodRaw : ('monthly' as const);
  const billingType = billingTypeFromInput(typeof body.billingType === 'string' ? body.billingType : 'BOLETO');

  if (!planSlug) {
    return NextResponse.json({ error: 'planSlug é obrigatório.' }, { status: 400 });
  }

  const exists = await planSlugExistsAndActive(planSlug);
  if (!exists) {
    return NextResponse.json({ error: 'Plano inválido ou inativo.' }, { status: 404 });
  }

  const targetPlan = await getPlanBySlugOrFallback(planSlug);
  if (userCount > targetPlan.usersLimit) {
    return NextResponse.json(
      {
        error: `Este plano permite no máximo ${targetPlan.usersLimit} usuário(s). Reduza a equipe antes de confirmar.`,
      },
      { status: 400 }
    );
  }

  const cycle = cycleFromPeriod(period);
  const base = targetPlan.price ?? 0;
  const value = cycle === 'YEARLY' ? base * 12 : cycle === 'SEMIANNUALLY' ? base * 6 : base;

  try {
    await asaasUpdateSubscription(subId, {
      billingType,
      value,
      cycle,
      description: `JADA - ${targetPlan.name} (${cycle})`,
    });
  } catch {
    return NextResponse.json(
      { error: 'Não foi possível atualizar a assinatura no provedor de pagamento.' },
      { status: 502 }
    );
  }

  await prisma.company.update({
    where: { id: company.id },
    data: {
      plan: planSlug,
      preferredBillingPeriod: period,
      preferredBillingType: billingType,
      billingCycle: cycle,
      billingLastEventAt: new Date(),
    },
  });

  const payments = await asaasListSubscriptionPayments(subId).catch(() => ({ data: [] as { status: string; invoiceUrl?: string; bankSlipUrl?: string }[] }));
  const paymentLink = pickPaymentLink(payments);

  return withNoStore(
    NextResponse.json({
      success: true,
      paymentLink,
      plan: planSlug,
      period,
      billingType,
    })
  );
}
