import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import BuyerAppShell from '@/components/app-shell/BuyerAppShell';
import { resolveBillingAccess } from '@/lib/billingAccess';
import { resolveLayoutCompanyId } from '@/lib/layoutTenant';
import { getSessionUser, isAssistantRole } from '@/lib/sessionContext';

export default async function BuyerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  const user = getSessionUser(session);
  const companyId = resolveLayoutCompanyId(session);
  if (!companyId) {
    redirect(user?.role === 'assistant' ? '/assistant' : '/login');
  }

  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: {
      approvalStatus: true,
      billingStatus: true,
      billingManuallyApproved: true,
      billingSubscriptionId: true,
      billingNextDueDate: true,
    },
  });

  const access = resolveBillingAccess({
    approvalStatus: company?.approvalStatus,
    billingStatus: company?.billingStatus,
    billingManuallyApproved: company?.billingManuallyApproved,
    billingSubscriptionId: company?.billingSubscriptionId,
    billingNextDueDate: company?.billingNextDueDate,
  });

  const skipBillingRedirect = isAssistantRole(user?.role);
  if (
    !skipBillingRedirect &&
    (access.shellState === 'awaiting' || access.shellState === 'blocked')
  ) {
    redirect('/aguardando-pagamento');
  }

  return (
    <BuyerAppShell billingNotice={access.billingNotice} assistantMode={skipBillingRedirect}>
      {children}
    </BuyerAppShell>
  );
}
