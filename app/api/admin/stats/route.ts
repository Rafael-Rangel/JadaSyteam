import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getAllPlans } from '@/lib/planService';
import { getPlanName as getFallbackName, getPlanPrice as getFallbackPrice } from '@/lib/plans';

export async function GET() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string })?.role;
  if (role !== 'admin') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
  }

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    allPlans,
    totalCompanies,
    totalUsers,
    requestsThisMonth,
    proposalsThisMonth,
    companiesByPlan,
    recentCompanies,
  ] = await Promise.all([
    getAllPlans(),
    prisma.company.count(),
    prisma.user.count(),
    prisma.request.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.proposal.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.company.groupBy({
      by: ['plan'],
      _count: { id: true },
    }),
    prisma.company.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        type: true,
        plan: true,
        createdAt: true,
      },
    }),
  ]);

  const priceBySlug: Record<string, number> = Object.fromEntries(
    allPlans.map((p) => [p.slug, p.price])
  );

  let revenueThisMonth = 0;
  for (const g of companiesByPlan) {
    const price = priceBySlug[g.plan] ?? getFallbackPrice(g.plan);
    revenueThisMonth += price * g._count.id;
  }

  const nameBySlug: Record<string, string> = Object.fromEntries(
    allPlans.map((p) => [p.slug, p.name])
  );

  return NextResponse.json({
    totalCompanies,
    totalUsers,
    requestsThisMonth,
    proposalsThisMonth,
    revenueThisMonth,
    recentCompanies: recentCompanies.map((c) => ({
      id: c.id,
      name: c.name,
      type: c.type,
      planName: nameBySlug[c.plan] ?? getFallbackName(c.plan),
      createdAt: c.createdAt,
    })),
  });
}
