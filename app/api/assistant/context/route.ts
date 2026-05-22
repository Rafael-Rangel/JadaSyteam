import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  assertAssistantCanAccessCompany,
  getSessionUser,
} from '@/lib/sessionContext';
import { logAssistantAction } from '@/lib/assistantAudit';
import { maskCnpj } from '@/lib/redactCompanyForAssistant';
import { resolveBillingAccess } from '@/lib/billingAccess';
import { enforceSameOrigin, withNoStore } from '@/lib/apiSecurity';

export async function GET() {
  const session = await getServerSession(authOptions);
  const user = getSessionUser(session);
  if (!user?.id || user.role !== 'assistant') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
  }

  if (!user.actingCompanyId) {
    return withNoStore(NextResponse.json({ active: null }));
  }

  const company = await prisma.company.findUnique({
    where: { id: user.actingCompanyId },
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
    },
  });

  if (!company) {
    return withNoStore(NextResponse.json({ active: null }));
  }

  const billing = resolveBillingAccess({
    approvalStatus: company.approvalStatus,
    billingStatus: company.billingStatus,
    billingManuallyApproved: company.billingManuallyApproved,
    billingSubscriptionId: company.billingSubscriptionId,
    billingNextDueDate: company.billingNextDueDate,
  });

  return withNoStore(
    NextResponse.json({
      active: {
        id: company.id,
        name: company.name,
        cnpjMasked: maskCnpj(company.cnpj),
        type: company.type,
        plan: company.plan,
        billingShellState: billing.shellState,
        allowBusinessActions: billing.allowBusinessActions,
      },
      actingCompanyType: user.actingCompanyType ?? company.type,
    })
  );
}

export async function POST(request: Request) {
  const sameOriginError = enforceSameOrigin(request);
  if (sameOriginError) return sameOriginError;

  const session = await getServerSession(authOptions);
  const user = getSessionUser(session);
  if (!user?.id || user.role !== 'assistant') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
  }

  let body: { companyId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const companyId = typeof body.companyId === 'string' ? body.companyId.trim() : '';
  if (!companyId) {
    return NextResponse.json({ error: 'companyId é obrigatório' }, { status: 400 });
  }

  const access = await assertAssistantCanAccessCompany({
    assistantUserId: user.id,
    companyId,
    restrictToAssignedCompanies: user.restrictToAssignedCompanies !== false,
  });
  if (!access.ok) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }

  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { id: true, name: true, type: true },
  });
  if (!company) {
    return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 });
  }

  await logAssistantAction({
    assistantUserId: user.id,
    companyId: company.id,
    action: 'enter_company',
    metadata: { companyName: company.name },
  });

  return withNoStore(
    NextResponse.json({
      ok: true,
      companyId: company.id,
      companyName: company.name,
      companyType: company.type,
      redirectTo:
        company.type === 'seller'
          ? '/seller/dashboard'
          : company.type === 'both'
            ? '/buyer/dashboard'
            : '/buyer/dashboard',
      sessionUpdate: {
        actingCompanyId: company.id,
        actingCompanyType: company.type,
      },
    })
  );
}

export async function DELETE(request: Request) {
  const sameOriginError = enforceSameOrigin(request);
  if (sameOriginError) return sameOriginError;

  const session = await getServerSession(authOptions);
  const user = getSessionUser(session);
  if (!user?.id || user.role !== 'assistant') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
  }

  const previousCompanyId = user.actingCompanyId ?? null;
  if (previousCompanyId) {
    await logAssistantAction({
      assistantUserId: user.id,
      companyId: previousCompanyId,
      action: 'leave_company',
    });
  }

  return withNoStore(
    NextResponse.json({
      ok: true,
      sessionUpdate: {
        actingCompanyId: null,
        actingCompanyType: null,
      },
    })
  );
}
