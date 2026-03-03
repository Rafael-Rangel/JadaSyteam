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

  const [allPlans, companiesByPlan, subscriptions] = await Promise.all([
    getAllPlans(),
    prisma.company.groupBy({
      by: ['plan'],
      _count: { id: true },
    }),
    prisma.company.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true,
        name: true,
        type: true,
        plan: true,
        createdAt: true,
      },
    }),
  ]);

  const byPlan: Record<string, { count: number; revenue: number }> = {};
  for (const p of allPlans) {
    byPlan[p.slug] = { count: 0, revenue: 0 };
  }
  let totalRevenue = 0;
  for (const g of companiesByPlan) {
    const price = allPlans.find((p) => p.slug === g.plan)?.price ?? getFallbackPrice(g.plan);
    const count = g._count.id;
    if (!byPlan[g.plan]) byPlan[g.plan] = { count: 0, revenue: 0 };
    byPlan[g.plan].count = count;
    byPlan[g.plan].revenue = count * price;
    totalRevenue += count * price;
  }

  const nameBySlug: Record<string, string> = Object.fromEntries(
    allPlans.map((p) => [p.slug, p.name])
  );

  return NextResponse.json({
    totalRevenue,
    byPlan: allPlans.map((p) => ({
      id: p.slug,
      name: p.name,
      price: p.price,
      companiesCount: byPlan[p.slug]?.count ?? 0,
      revenue: byPlan[p.slug]?.revenue ?? 0,
    })),
    subscriptions: subscriptions.map((c) => ({
      id: c.id,
      name: c.name,
      type: c.type,
      plan: nameBySlug[c.plan] ?? getFallbackName(c.plan),
      createdAt: c.createdAt,
    })),
  });
}
