import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { resolveBillingAccess } from '@/lib/billingAccess';
import { getEffectiveCompanyId, getSessionUser, isAssistantRole } from '@/lib/sessionContext';
import { logAssistantAction } from '@/lib/assistantAudit';

export type ActiveBillingContext = {
  companyId: string;
  companyType: string;
  companyPlan: string;
  supportMode?: boolean;
};

export async function requireActiveBilling(): Promise<
  | { ok: true; context: ActiveBillingContext }
  | { ok: false; status: number; error: string }
> {
  const session = await getServerSession(authOptions);
  const user = getSessionUser(session);
  if (!user?.id) {
    return { ok: false, status: 401, error: 'Não autorizado' };
  }

  const companyId = getEffectiveCompanyId(user);
  if (!companyId) {
    return { ok: false, status: 403, error: 'Selecione uma empresa cliente para continuar.' };
  }

  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: {
      id: true,
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
    return { ok: false, status: 404, error: 'Empresa não encontrada' };
  }

  const access = resolveBillingAccess({
    approvalStatus: company.approvalStatus,
    billingStatus: company.billingStatus,
    billingManuallyApproved: company.billingManuallyApproved,
    billingSubscriptionId: company.billingSubscriptionId,
    billingNextDueDate: company.billingNextDueDate,
  });

  if (!access.allowBusinessActions) {
    if (isAssistantRole(user.role)) {
      await logAssistantAction({
        assistantUserId: user.id,
        companyId: company.id,
        action: 'billing_support_bypass',
        metadata: {
          shellState: access.shellState,
          billingStatus: company.billingStatus,
          approvalStatus: company.approvalStatus,
        },
      });
      return {
        ok: true,
        context: {
          companyId: company.id,
          companyType: company.type,
          companyPlan: company.plan,
          supportMode: true,
        },
      };
    }
    return {
      ok: false,
      status: 403,
      error:
        access.shellState === 'grace'
          ? 'Acesso às funções bloqueado durante a tolerância de pagamento. Regularize em Assinatura.'
          : 'Acesso bloqueado. Aguardando aprovação ou pagamento.',
    };
  }

  return {
    ok: true,
    context: {
      companyId: company.id,
      companyType: company.type,
      companyPlan: company.plan,
    },
  };
}
