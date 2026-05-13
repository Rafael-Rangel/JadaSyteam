'use client';

import { ReactNode } from 'react';
import {
  LayoutDashboard,
  ShoppingCart,
  FileText,
  User,
  Users,
  CreditCard,
} from 'lucide-react';
import DashboardAppShell from '@/components/app-shell/DashboardAppShell';
import type { SidebarItem } from '@/components/ui/Sidebar';

const buyerItems: SidebarItem[] = [
  { href: '/buyer/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-[18px] h-[18px]" /> },
  { href: '/buyer/requests', label: 'Requisições', icon: <FileText className="w-[18px] h-[18px]" /> },
  { href: '/buyer/create-request', label: 'Nova requisição', icon: <ShoppingCart className="w-[18px] h-[18px]" /> },
  { href: '/buyer/users', label: 'Equipe', icon: <Users className="w-[18px] h-[18px]" /> },
  { href: '/buyer/subscription', label: 'Assinatura', icon: <CreditCard className="w-[18px] h-[18px]" /> },
  { href: '/buyer/profile', label: 'Perfil', icon: <User className="w-[18px] h-[18px]" /> },
];

export default function BuyerAppShell({ children }: { children: ReactNode }) {
  return (
    <DashboardAppShell
      items={buyerItems}
      subtitle="Comprador"
      topbarLabel="Área do comprador"
      brandHref="/buyer/dashboard"
    >
      {children}
    </DashboardAppShell>
  );
}
