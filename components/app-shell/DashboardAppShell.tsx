'use client';

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { LogOut, Menu } from 'lucide-react';
import Sidebar, { SidebarItem } from '@/components/ui/Sidebar';
import { ToastProvider } from '@/components/ui/Toast';

export type DashboardAppShellProps = {
  children: ReactNode;
  items: SidebarItem[];
  subtitle: string;
  topbarLabel: string;
  brandHref: string;
  billingNotice?: { level: 'info' | 'warning' | 'danger'; message: string } | null;
  subscriptionHref?: string;
};

export default function DashboardAppShell({
  children,
  items,
  subtitle,
  topbarLabel,
  brandHref,
  billingNotice,
  subscriptionHref,
}: DashboardAppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: session } = useSession();
  const userName = session?.user?.name ?? 'Usuário';
  const userEmail = session?.user?.email ?? '';
  const initials = userName
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <ToastProvider>
      <div className="min-h-screen bg-neutral-50 flex">
        <Sidebar
          items={items}
          brandHref={brandHref}
          subtitle={subtitle}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          footer={
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: '/' })}
              className="flex min-h-11 w-full touch-manipulation items-center gap-2 rounded-md px-3 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-danger-700 focus-ring lg:min-h-10 lg:h-10"
            >
              <LogOut className="w-[18px] h-[18px] text-neutral-500" />
              <span>Sair</span>
            </button>
          }
        />

        <div className="flex-1 min-w-0 flex flex-col">
          <header className="sticky top-0 z-30 flex h-14 min-h-[3.5rem] items-center justify-between gap-3 border-b border-neutral-200 bg-white/80 px-4 backdrop-blur sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                aria-label="Abrir navegação"
                className="inline-flex h-11 min-h-11 w-11 min-w-11 touch-manipulation items-center justify-center rounded-md border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 focus-ring lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>
              <p className="hidden min-w-0 truncate text-xs font-medium text-neutral-500 sm:block">{topbarLabel}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col items-end leading-tight">
                <span className="text-sm font-medium text-neutral-800">{userName}</span>
                {userEmail && <span className="text-[11px] text-neutral-500">{userEmail}</span>}
              </div>
              <div className="h-9 w-9 rounded-full bg-primary-600 text-white flex items-center justify-center text-sm font-semibold">
                {initials || 'J'}
              </div>
            </div>
          </header>

          {billingNotice && (
            <div
              className={`px-4 py-2.5 text-sm border-b sm:px-6 lg:px-8 ${
                billingNotice.level === 'danger'
                  ? 'bg-danger-50 text-danger-900 border-danger-100'
                  : billingNotice.level === 'warning'
                    ? 'bg-amber-50 text-amber-950 border-amber-100'
                    : 'bg-primary-50 text-primary-950 border-primary-100'
              }`}
            >
              <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
                <p>{billingNotice.message}</p>
                {subscriptionHref && (
                  <Link
                    href={subscriptionHref}
                    className="font-medium underline underline-offset-2 shrink-0"
                  >
                    Ir para Assinatura
                  </Link>
                )}
              </div>
            </div>
          )}

          <main className="flex-1 px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
            <div className="max-w-7xl mx-auto w-full">{children}</div>
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
