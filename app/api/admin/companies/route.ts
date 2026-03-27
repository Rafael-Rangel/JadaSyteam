import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getAllPlans } from '@/lib/planService';
import { getPlanName as getFallbackName } from '@/lib/plans';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string })?.role;
  if (role !== 'admin') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search')?.trim() || '';
  const type = searchParams.get('type')?.trim() || '';
  const plan = searchParams.get('plan')?.trim() || '';
  const verificationStatus = searchParams.get('verificationStatus')?.trim() || '';

  const where: Record<string, unknown> = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { cnpj: { contains: search, mode: 'insensitive' } },
    ];
  }
  if (type) where.type = type;
  if (plan) where.plan = plan;
  if (verificationStatus && ['pending', 'approved', 'rejected'].includes(verificationStatus)) {
    where.verificationStatus = verificationStatus;
  }

  const [allPlans, companies] = await Promise.all([
    getAllPlans(),
    prisma.company.findMany({
      where: Object.keys(where).length ? where : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { users: true, requests: true, proposals: true },
        },
      },
    }),
  ]);

  const nameBySlug: Record<string, string> = Object.fromEntries(
    allPlans.map((p) => [p.slug, p.name])
  );

  const list = companies.map((c) => ({
    id: c.id,
    name: c.name,
    cnpj: c.cnpj,
    type: c.type,
    plan: c.plan,
    planName: nameBySlug[c.plan] ?? getFallbackName(c.plan),
    verificationStatus: c.verificationStatus ?? 'pending',
    approvalStatus: c.approvalStatus ?? 'pending',
    billingStatus: c.billingStatus ?? null,
    verifiedAt: c.verifiedAt?.toISOString() ?? null,
    createdAt: c.createdAt,
    usersCount: c._count.users,
    requestsCount: c._count.requests,
    proposalsCount: c._count.proposals,
  }));

  return NextResponse.json(list);
}
