import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getAllPlans } from '@/lib/planService';
import { getPlanName as getFallbackName } from '@/lib/plans';
import { andExcludePlatformCompany } from '@/lib/platformCompany';
import type { Prisma } from '@prisma/client';

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

  const where: Prisma.CompanyWhereInput = {};
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
      where: andExcludePlatformCompany(where),
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { users: true, requests: true, proposals: true },
        },
      },
    }),
  ]);

  const companyIds = companies.map((c) => c.id);
  const serasaReports =
    companyIds.length > 0
      ? await prisma.dueDiligenceReport.findMany({
          where: { companyId: { in: companyIds }, kind: 'score', provider: 'asaas' },
          orderBy: { createdAt: 'desc' },
          select: { companyId: true, summary: true, createdAt: true },
        })
      : [];
  const serasaByCompany = new Map<string, { downloadUrl: string | null; reportAt: string }>();
  for (const r of serasaReports) {
    if (serasaByCompany.has(r.companyId)) continue;
    const summary = (r.summary as { downloadUrl?: string } | null) ?? null;
    serasaByCompany.set(r.companyId, {
      downloadUrl: summary?.downloadUrl ?? null,
      reportAt: r.createdAt.toISOString(),
    });
  }

  const nameBySlug: Record<string, string> = Object.fromEntries(
    allPlans.map((p) => [p.slug, p.name])
  );

  const list = companies.map((c) => {
    const serasa = serasaByCompany.get(c.id);
    return {
      id: c.id,
      name: c.name,
      cnpj: c.cnpj,
      type: c.type,
      plan: c.plan,
      planName: nameBySlug[c.plan] ?? getFallbackName(c.plan),
      verificationStatus: c.verificationStatus ?? 'pending',
      approvalStatus: c.approvalStatus ?? 'pending',
      billingStatus: c.billingStatus ?? null,
      riskLevel: c.riskLevel ?? 'unknown',
      serasaScore: c.serasaScore ?? null,
      serasaCheckedAt: c.serasaCheckedAt?.toISOString() ?? null,
      serasaDownloadUrl: serasa?.downloadUrl ?? null,
      lastDueDiligenceAt: c.lastDueDiligenceAt?.toISOString() ?? null,
      verifiedAt: c.verifiedAt?.toISOString() ?? null,
      createdAt: c.createdAt,
      usersCount: c._count.users,
      requestsCount: c._count.requests,
      proposalsCount: c._count.proposals,
    };
  });

  return NextResponse.json(list);
}
