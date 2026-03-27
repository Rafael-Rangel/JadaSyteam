import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getPlanBySlugOrFallback } from '@/lib/planService';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.companyId) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const company = await prisma.company.findUnique({
    where: { id: session.user.companyId },
  });
  if (!company) {
    return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 });
  }

  const planData = await getPlanBySlugOrFallback(company.plan);

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const isSeller = company.type === 'seller' || company.type === 'both';

  const [userCount, requestsThisMonth, proposalsThisMonth] = await Promise.all([
    prisma.user.count({ where: { companyId: company.id } }),
    prisma.request.count({
      where: {
        buyerId: company.id,
        createdAt: { gte: startOfMonth },
      },
    }),
    isSeller ? prisma.proposal.count({
      where: {
        sellerId: company.id,
        createdAt: { gte: startOfMonth },
      },
    }) : Promise.resolve(0),
  ]);

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
