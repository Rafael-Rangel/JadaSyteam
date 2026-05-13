'use client';

import { ReactNode, useState } from 'react';
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
};

export default function DashboardAppShell({
  children,
  items,
  subtitle,
  topbarLabel,
  brandHref,
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
              className="w-full flex items-center gap-2 h-10 px-3 rounded-md text-sm font-medium text-neutral-600 hover:bg-neutral-100 hover:text-danger-700 transition-colors focus-ring"
            >
              <LogOut className="w-[18px] h-[18px] text-neutral-500" />
              <span>Sair</span>
            </button>
          }
        />

        <div className="flex-1 min-w-0 flex flex-col">
          <header className="sticky top-0 z-30 h-14 bg-white/80 backdrop-blur border-b border-neutral-200 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                aria-label="Abrir navegação"
                className="lg:hidden inline-flex items-center justify-center h-9 w-9 rounded-md border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 focus-ring"
              >
                <Menu className="w-4 h-4" />
              </button>
              <p className="hidden sm:block text-xs font-medium text-neutral-500">{topbarLabel}</p>
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

          <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
            <div className="max-w-7xl mx-auto w-full">{children}</div>
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
