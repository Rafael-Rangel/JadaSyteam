import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import SellerAppShell from '@/components/app-shell/SellerAppShell';
import { resolveBillingAccess } from '@/lib/billingAccess';

export default async function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.companyId) {
    redirect('/login');
  }

  const company = await prisma.company.findUnique({
    where: { id: session.user.companyId },
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

  if (access.shellState === 'awaiting' || access.shellState === 'blocked') {
    redirect('/aguardando-pagamento');
  }

  return <SellerAppShell billingNotice={access.billingNotice}>{children}</SellerAppShell>;
}
