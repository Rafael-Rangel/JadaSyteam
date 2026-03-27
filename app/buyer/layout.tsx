import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function BuyerLayout({
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
    select: { approvalStatus: true, billingStatus: true, billingManuallyApproved: true },
  });

  const approvedByOps = company?.approvalStatus === 'approved';
  const canAccess =
    (approvedByOps && company?.billingStatus === 'active') || company?.billingManuallyApproved === true;

  if (!canAccess) {
    redirect('/aguardando-pagamento');
  }

  return <>{children}</>;
}
