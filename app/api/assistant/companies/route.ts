import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/sessionContext';
import { excludePlatformCompanyWhere } from '@/lib/platformCompany';
import { maskCnpj } from '@/lib/redactCompanyForAssistant';
import { resolveBillingAccess } from '@/lib/billingAccess';
import { withNoStore } from '@/lib/apiSecurity';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  const user = getSessionUser(session);
  if (!user?.id || user.role !== 'assistant') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.trim().toLowerCase();

  let companyIds: string[] | undefined;
  if (user.restrictToAssignedCompanies !== false) {
    const assignments = await prisma.assistantCompanyAssignment.findMany({
      where: { assistantUserId: user.id },
      select: { companyId: true },
    });
    companyIds = assignments.map((a) => a.companyId);
    if (companyIds.length === 0) {
      return withNoStore(NextResponse.json({ companies: [] }));
    }
  }

  const companies = await prisma.company.findMany({
    where: {
      ...excludePlatformCompanyWhere,
      ...(companyIds ? { id: { in: companyIds } } : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: 'insensitive' } },
              { cnpj: { contains: q.replace(/\D/g, '') } },
            ],
          }
        : {}),
    },
    select: {
      id: true,
      name: true,
      cnpj: true,
      type: true,
      plan: true,
      approvalStatus: true,
      billingStatus: true,
      billingManuallyApproved: true,
      billingSubscriptionId: true,
      billingNextDueDate: true,
      verificationStatus: true,
      updatedAt: true,
    },
    orderBy: { name: 'asc' },
    take: 100,
  });

  const list = companies.map((c) => {
    const billing = resolveBillingAccess({
      approvalStatus: c.approvalStatus,
      billingStatus: c.billingStatus,
      billingManuallyApproved: c.billingManuallyApproved,
      billingSubscriptionId: c.billingSubscriptionId,
      billingNextDueDate: c.billingNextDueDate,
    });
    return {
      id: c.id,
      name: c.name,
      cnpjMasked: maskCnpj(c.cnpj),
      type: c.type,
      plan: c.plan,
      verificationStatus: c.verificationStatus,
      approvalStatus: c.approvalStatus,
      billingShellState: billing.shellState,
      allowBusinessActions: billing.allowBusinessActions,
      updatedAt: c.updatedAt.toISOString(),
    };
  });

  return withNoStore(NextResponse.json({ companies: list }));
}
