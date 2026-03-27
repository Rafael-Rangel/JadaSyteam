import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { asaasListSubscriptionPayments } from '@/lib/asaas';

/**
 * Retorna o link de pagamento atual (invoiceUrl ou bankSlipUrl) da primeira cobrança pendente da assinatura.
 * Usado na página "Aguardando pagamento" e na área financeira quando status é pending.
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.companyId) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const company = await prisma.company.findUnique({
    where: { id: session.user.companyId },
    select: {
      billingSubscriptionId: true,
      billingStatus: true,
      approvalStatus: true,
      preferredBillingType: true,
    },
  });
  if (!company?.billingSubscriptionId) {
    return NextResponse.json({
      paymentLink: null,
      status: company?.billingStatus ?? null,
      approvalStatus: company?.approvalStatus ?? 'pending',
      preferredBillingType: company?.preferredBillingType ?? null,
    });
  }

  const payments = await asaasListSubscriptionPayments(company.billingSubscriptionId).catch(() => ({
    data: [] as {
      status: string;
      billingType?: string;
      dueDate?: string;
      invoiceUrl?: string;
      bankSlipUrl?: string;
    }[],
  }));
  const paid = payments.data?.find(
    (p) =>
      p.status === 'RECEIVED' ||
      p.status === 'CONFIRMED' ||
      p.status === 'RECEIVED_IN_CASH' ||
      p.status === 'CHECKOUT_PAID'
  );
  const pending = payments.data?.find(
    (p) => p.status === 'PENDING' || p.status === 'AWAITING_RISK_ANALYSIS'
  );
  const link = pending?.invoiceUrl ?? pending?.bankSlipUrl ?? null;
  const preferredBillingType =
    company.preferredBillingType ?? pending?.billingType ?? paid?.billingType ?? null;

  let status = company.billingStatus;
  if (!status && pending) status = 'pending';
  if ((status === 'pending' || status == null) && paid) {
    status = 'active';
    await prisma.company.update({
      where: { id: session.user.companyId },
      data: {
        billingStatus: 'active',
        billingLastEventAt: new Date(),
      },
    }).catch(() => null);
  }

  return NextResponse.json({
    paymentLink: link,
    status,
    approvalStatus: company.approvalStatus ?? 'pending',
    preferredBillingType,
  });
}
