import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getPlanBySlugOrFallback } from '@/lib/planService';
import { resolveBillingAccess } from '@/lib/billingAccess';
import { resolveTenantAccess } from '@/lib/sessionContext';

export async function GET() {
  const session = await getServerSession(authOptions);
  const tenant = await resolveTenantAccess(session);
  if (!tenant.ok) {
    return NextResponse.json({ error: tenant.error }, { status: tenant.status });
  }

  const company = await prisma.company.findUnique({
    where: { id: tenant.companyId },
    select: {
      id: true,
      type: true,
      plan: true,
      verificationStatus: true,
      billingProvider: true,
      billingStatus: true,
      billingCycle: true,
      billingNextDueDate: true,
      billingSubscriptionId: true,
      approvalStatus: true,
      billingManuallyApproved: true,
      preferredBillingType: true,
      preferredBillingPeriod: true,
    },
  });
  if (!company) {
    return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 });
  }

  const planData = await getPlanBySlugOrFallback(company.plan);

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const isSeller = company.type === 'seller' || company.type === 'both';

  const [userCount, requestsThisMonth, proposalsThisMonth] = await Promise.all([
    prisma.user.count({ where: { companyId: company.id, deletedAt: null } }),
    prisma.request.count({
      where: {
        buyerId: company.id,
        createdAt: { gte: startOfMonth },
      },
    }),
    isSeller
      ? prisma.proposal.count({
          where: {
            sellerId: company.id,
            createdAt: { gte: startOfMonth },
          },
        })
      : Promise.resolve(0),
  ]);

  const access = resolveBillingAccess({
    approvalStatus: company.approvalStatus,
    billingStatus: company.billingStatus,
    billingManuallyApproved: company.billingManuallyApproved,
    billingSubscriptionId: company.billingSubscriptionId,
    billingNextDueDate: company.billingNextDueDate,
  });

  const response: Record<string, unknown> = {
    plan: company.plan,
    planName: planData.name,
    planPrice: planData.price,
    verificationStatus: company.verificationStatus ?? 'pending',
    billing: {
      provider: company.billingProvider ?? null,
      status: company.billingStatus ?? null,
      cycle: company.billingCycle ?? null,
      nextDueDate: company.billingNextDueDate?.toISOString() ?? null,
      subscriptionId: company.billingSubscriptionId ?? null,
      preferredBillingType: company.preferredBillingType ?? null,
      preferredBillingPeriod: company.preferredBillingPeriod ?? null,
    },
    access: {
      shellState: access.shellState,
      renewalEligible: access.renewalEligible,
      allowBusinessActions: access.allowBusinessActions,
      graceDaysRemaining: access.graceDaysRemaining,
    },
    limits: {
      users: planData.usersLimit,
      requestsPerMonth: planData.requestsPerMonthLimit,
      proposalsPerMonth: planData.proposalsPerMonthLimit,
    },
    usage: {
      users: userCount,
      requestsThisMonth,
      proposalsThisMonth,
    },
  };
  return NextResponse.json(response);
}
