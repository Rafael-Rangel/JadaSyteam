import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { resolveBillingAccess } from '@/lib/billingAccess';
import { canManageBillingOperations } from '@/lib/billingOperatorAccess';
import { billingTypeFromInput, createBillingForCompany } from '@/lib/asaasBilling';
import { logAssistantAction } from '@/lib/assistantAudit';
import { enforceSameOrigin } from '@/lib/apiSecurity';
import { resolveTenantAccess } from '@/lib/sessionContext';

export async function POST(request: Request) {
  const sameOriginError = enforceSameOrigin(request);
  if (sameOriginError) return sameOriginError;

  const session = await getServerSession(authOptions);
  const tenant = await resolveTenantAccess(session);
  if (!tenant.ok) {
    return NextResponse.json({ error: tenant.error }, { status: tenant.status });
  }

  const role = session?.user?.role;
  const company = await prisma.company.findUnique({
    where: { id: tenant.companyId },
    select: {
      id: true,
      approvalStatus: true,
      billingStatus: true,
      billingManuallyApproved: true,
      billingSubscriptionId: true,
      billingNextDueDate: true,
      preferredBillingType: true,
      preferredBillingPeriod: true,
    },
  });
  if (!company) {
    return NextResponse.json({ error: 'Empresa não encontrada.' }, { status: 404 });
  }

  const access = resolveBillingAccess({
    approvalStatus: company.approvalStatus,
    billingStatus: company.billingStatus,
    billingManuallyApproved: company.billingManuallyApproved,
    billingSubscriptionId: company.billingSubscriptionId,
    billingNextDueDate: company.billingNextDueDate,
  });

  if (!canManageBillingOperations(role, access)) {
    return NextResponse.json(
      {
        error:
          'Emissão de cobrança só está disponível na janela de renovação ou para a equipe JADA em modo suporte.',
      },
      { status: 403 }
    );
  }

  if (company.approvalStatus !== 'approved') {
    return NextResponse.json(
      { error: 'A empresa precisa estar aprovada antes de emitir cobrança.' },
      { status: 400 }
    );
  }

  const body = await request.json().catch(() => ({} as Record<string, unknown>));
  const billingType = billingTypeFromInput(
    typeof body.billingType === 'string'
      ? body.billingType
      : company.preferredBillingType || 'BOLETO'
  );
  const period =
    typeof body.period === 'string' && body.period.trim()
      ? body.period.trim()
      : company.preferredBillingPeriod || 'monthly';

  const result = await createBillingForCompany({
    companyId: company.id,
    billingType,
    period,
  });

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  if (role === 'assistant' && session?.user?.id) {
    await logAssistantAction({
      assistantUserId: session.user.id,
      companyId: company.id,
      action: 'billing_support_issue_payment',
      metadata: {
        billingType,
        period,
        subscriptionId: result.subscriptionId,
        alreadyExists: result.alreadyExists ?? false,
      },
    });
  }

  return NextResponse.json({
    success: true,
    paymentLink: result.paymentLink,
    subscriptionId: result.subscriptionId,
    payment: result.payment,
    alreadyExists: result.alreadyExists ?? false,
  });
}
