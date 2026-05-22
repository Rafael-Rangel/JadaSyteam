'use client';

import { ReactNode } from 'react';
import {
  LayoutDashboard,
  Sparkles,
  FileText,
  User,
  Users,
  CreditCard,
  Settings,
} from 'lucide-react';
import DashboardAppShell from '@/components/app-shell/DashboardAppShell';
import type { SidebarItem } from '@/components/ui/Sidebar';

type SellerAppShellProps = {
  children: ReactNode;
  billingNotice?: { level: 'info' | 'warning' | 'danger'; message: string } | null;
  assistantMode?: boolean;
};

const sellerItems: SidebarItem[] = [
  { href: '/seller/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-[18px] h-[18px]" /> },
  { href: '/seller/opportunities', label: 'Oportunidades', icon: <Sparkles className="w-[18px] h-[18px]" /> },
  { href: '/seller/proposals', label: 'Propostas', icon: <FileText className="w-[18px] h-[18px]" /> },
  { href: '/seller/users', label: 'Equipe', icon: <Users className="w-[18px] h-[18px]" /> },
  { href: '/seller/subscription', label: 'Assinatura', icon: <CreditCard className="w-[18px] h-[18px]" /> },
  { href: '/seller/settings', label: 'Configurações', icon: <Settings className="w-[18px] h-[18px]" /> },
  { href: '/seller/profile', label: 'Perfil', icon: <User className="w-[18px] h-[18px]" /> },
];

export default function SellerAppShell({ children, billingNotice, assistantMode }: SellerAppShellProps) {
  return (
    <DashboardAppShell
      items={sellerItems}
      subtitle="Vendedor"
      topbarLabel="Área do vendedor"
      brandHref="/seller/dashboard"
      billingNotice={billingNotice}
      subscriptionHref="/seller/subscription"
      assistantMode={assistantMode}
    >
      {children}
    </DashboardAppShell>
  );
}
