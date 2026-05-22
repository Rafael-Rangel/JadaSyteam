import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getSessionUser } from '@/lib/sessionContext';
import Header from '@/components/Header';

export default async function AssistantLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  const user = getSessionUser(session);
  if (!user?.id) redirect('/login');
  if (user.role !== 'assistant') {
    if (user.role === 'admin') redirect('/admin/dashboard');
    redirect('/buyer/dashboard');
  }

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <Header userType={null} />
      <main className="flex-grow py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">{children}</main>
    </div>
  );
}
