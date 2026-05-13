import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { resolveBillingAccess } from '@/lib/billingAccess';

export type ActiveBillingContext = {
  companyId: string;
  companyType: string;
  companyPlan: string;
};

export async function requireActiveBilling(): Promise<
  | { ok: true; context: ActiveBillingContext }
  | { ok: false; status: number; error: string }
> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.companyId) {
    return { ok: false, status: 401, error: 'Não autorizado' };
  }

  const company = await prisma.company.findUnique({
    where: { id: session.user.companyId },
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
