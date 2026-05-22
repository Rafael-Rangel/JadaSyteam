'use client';

import { ReactNode, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import {
  LayoutDashboard,
  Building2,
  Receipt,
  CreditCard,
  UserCog,
  Users,
  LogOut,
  Menu,
} from 'lucide-react';
import Sidebar, { SidebarItem } from '@/components/ui/Sidebar';
import { ToastProvider } from '@/components/ui/Toast';

const adminItems: SidebarItem[] = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-[18px] h-[18px]" /> },
  { href: '/admin/companies', label: 'Empresas', icon: <Building2 className="w-[18px] h-[18px]" /> },
  { href: '/admin/users', label: 'Equipe JADA', icon: <Users className="w-[18px] h-[18px]" /> },
  { href: '/admin/plans', label: 'Planos', icon: <CreditCard className="w-[18px] h-[18px]" /> },
  { href: '/admin/financial', label: 'Financeiro', icon: <Receipt className="w-[18px] h-[18px]" /> },
  { href: '/admin/profile', label: 'Perfil', icon: <UserCog className="w-[18px] h-[18px]" /> },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: session } = useSession();
  const userName = session?.user?.name ?? 'Admin';
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
          items={adminItems}
          brandHref="/admin/dashboard"
          subtitle="Admin"
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
          {/* Topbar */}
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
              <p className="hidden min-w-0 truncate text-xs font-medium text-neutral-500 sm:block">
                Painel administrativo
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col items-end leading-tight">
                <span className="text-sm font-medium text-neutral-800">{userName}</span>
                {userEmail && (
                  <span className="text-[11px] text-neutral-500">{userEmail}</span>
                )}
              </div>
              <div className="h-9 w-9 rounded-full bg-primary-600 text-white flex items-center justify-center text-sm font-semibold">
                {initials || 'A'}
              </div>
            </div>
          </header>

          <main className="flex-1 px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
            <div className="max-w-7xl mx-auto w-full">{children}</div>
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
