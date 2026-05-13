import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { asaasListSubscriptionPayments } from '@/lib/asaas';
import { getRequestRateKey, rateLimitByKey } from '@/lib/rateLimit';
import { asaasBillingTypeLabelPt, asaasPaymentStatusLabelPt } from '@/lib/paymentLabels';
import { withNoStore } from '@/lib/apiSecurity';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.companyId) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const limiter = rateLimitByKey(`sub-payments:${getRequestRateKey(request)}`, 40, 60_000);
  if (!limiter.allowed) {
    return NextResponse.json({ error: 'Muitas requisições.' }, { status: 429 });
  }

  const company = await prisma.company.findUnique({
    where: { id: session.user.companyId },
    select: { billingSubscriptionId: true },
  });
  if (!company) {
    return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 });
  }

  const subId = company.billingSubscriptionId?.trim();
  if (!subId) {
    return withNoStore(NextResponse.json({ payments: [], summary: { paidTotal: 0, pendingTotal: 0 } }));
  }

  const raw = await asaasListSubscriptionPayments(subId).catch(() => ({ data: [] as any[] }));

  const paidStatuses = new Set([
    'CONFIRMED',
    'RECEIVED',
    'RECEIVED_IN_CASH',
    'CHECKOUT_PAID',
  ]);
  let paidTotal = 0;
  let pendingTotal = 0;

  const payments = (raw.data ?? []).map((p) => {
    const st = String(p.status || '');
    if (paidStatuses.has(st.toUpperCase())) paidTotal += Number(p.value) || 0;
    if (st.toUpperCase() === 'PENDING' || st.toUpperCase() === 'AWAITING_RISK_ANALYSIS') {
      pendingTotal += Number(p.value) || 0;
    }
    return {
      id: p.id,
      status: st,
      statusLabel: asaasPaymentStatusLabelPt(st),
      value: Number(p.value) || 0,
      netValue: p.netValue != null ? Number(p.netValue) : null,
      feeValue: p.feeValue != null ? Number(p.feeValue) : null,
      dueDate: p.dueDate ?? null,
      paymentDate: p.paymentDate ?? p.clientPaymentDate ?? p.creditDate ?? null,
      billingType: p.billingType ?? null,
      billingTypeLabel: asaasBillingTypeLabelPt(p.billingType),
      description: p.description ?? null,
      invoiceNumber: p.invoiceNumber ?? null,
      invoiceUrl: p.invoiceUrl ?? null,
      bankSlipUrl: p.bankSlipUrl ?? null,
    };
  });

  return withNoStore(
    NextResponse.json({
      payments,
      summary: {
        paidTotal,
        pendingTotal,
        count: payments.length,
      },
    })
  );
}
