import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { resolveBillingAccess } from '@/lib/billingAccess';
import { getRequestRateKey, rateLimitByKey } from '@/lib/rateLimit';
import { withNoStore } from '@/lib/apiSecurity';
import { resolveTenantAccess } from '@/lib/sessionContext';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  const tenant = await resolveTenantAccess(session);
  if (!tenant.ok) {
    return NextResponse.json({ error: tenant.error }, { status: tenant.status });
  }

  const limiter = rateLimitByKey(`billing-notice:${getRequestRateKey(request)}`, 60, 60_000);
  if (!limiter.allowed) {
    return NextResponse.json({ error: 'Muitas requisições.' }, { status: 429 });
  }

  const company = await prisma.company.findUnique({
    where: { id: tenant.companyId },
    select: {
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

  const access = resolveBillingAccess({
    approvalStatus: company.approvalStatus,
    billingStatus: company.billingStatus,
    billingManuallyApproved: company.billingManuallyApproved,
    billingSubscriptionId: company.billingSubscriptionId,
    billingNextDueDate: company.billingNextDueDate,
  });

  return withNoStore(
    NextResponse.json({
      shellState: access.shellState,
      renewalEligible: access.renewalEligible,
      allowBusinessActions: access.allowBusinessActions,
      billingNotice: access.billingNotice,
      graceDaysRemaining: access.graceDaysRemaining,
    })
  );
}
