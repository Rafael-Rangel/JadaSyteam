import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { asaasUpdateSubscription, AsaasBillingType } from '@/lib/asaas';

function normalizeBillingType(value: unknown): AsaasBillingType | null {
  const raw = typeof value === 'string' ? value.toUpperCase() : '';
  if (raw === 'PIX' || raw === 'BOLETO' || raw === 'CREDIT_CARD') return raw;
  return null;
}

function normalizePeriod(value: unknown): 'monthly' | 'semiannually' | 'yearly' {
  const raw = typeof value === 'string' ? value : 'monthly';
  if (raw === 'semiannually' || raw === 'yearly') return raw;
  return 'monthly';
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.companyId) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const body = await request.json().catch(() => ({} as Record<string, unknown>));
  const billingType = normalizeBillingType(body.billingType);
  if (!billingType) {
    return NextResponse.json({ error: 'billingType inválido (PIX|BOLETO|CREDIT_CARD).' }, { status: 400 });
  }
  const period = normalizePeriod(body.period);

  const company = await prisma.company.findUnique({
    where: { id: session.user.companyId },
    select: { id: true, billingSubscriptionId: true },
  });
  if (!company) {
    return NextResponse.json({ error: 'Empresa não encontrada.' }, { status: 404 });
  }

  if (company.billingSubscriptionId) {
    // Atualiza método na assinatura ativa quando possível.
    await asaasUpdateSubscription(company.billingSubscriptionId, {
      billingType,
    }).catch(() => null);
  }

  await prisma.company.update({
    where: { id: company.id },
    data: {
      preferredBillingType: billingType,
      preferredBillingPeriod: period,
    },
  });

  return NextResponse.json({
    success: true,
    preferredBillingType: billingType,
    preferredBillingPeriod: period,
  });
}
