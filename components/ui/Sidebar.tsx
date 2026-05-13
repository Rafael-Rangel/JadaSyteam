'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import { X } from 'lucide-react';

export interface SidebarItem {
  href: string;
  label: string;
  icon: ReactNode;
}

interface SidebarProps {
  items: SidebarItem[];
  /** Link do logo (ex.: /buyer/dashboard) */
  brandHref?: string;
  title?: string;
  subtitle?: string;
  footer?: ReactNode;
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({
  items,
  brandHref = '/admin/dashboard',
  title = 'JADA',
  subtitle,
  footer,
  open,
  onClose,
}: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || (href !== '/' && pathname?.startsWith(href + '/'));

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-neutral-900/50 lg:hidden transition-opacity ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={`fixed lg:sticky inset-y-0 left-0 top-0 z-50 lg:z-auto h-screen w-[260px] shrink-0 border-r border-neutral-200 bg-white flex flex-col transform transition-transform duration-200 ease-out lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Navegação principal"
      >
        <div className="flex items-center justify-between px-4 h-14 border-b border-neutral-200 shrink-0">
          <Link
            href={brandHref}
            className="flex items-center gap-2.5 text-neutral-900 focus-ring rounded-md"
            onClick={onClose}
          >
            <Image
              src="/logo.jpg"
              alt="JADA"
              width={28}
              height={28}
              className="h-7 w-7 rounded-md object-cover"
              priority
            />
            <div className="leading-tight">
              <p className="text-sm font-semibold tracking-tight">{title}</p>
              {subtitle && (
                <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-500">
                  {subtitle}
                </p>
              )}
            </div>
          </Link>
          <button
            type="button"
            className="inline-flex h-10 w-10 touch-manipulation items-center justify-center rounded-md text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 lg:hidden"
            onClick={onClose}
            aria-label="Fechar navegação"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto scrollbar-thin">
          {items.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                aria-current={active ? 'page' : undefined}
                className={`relative flex min-h-11 touch-manipulation items-center gap-2.5 rounded-md px-3 text-sm font-medium transition-colors focus-ring lg:min-h-10 lg:h-10 ${
                  active
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                }`}
              >
                {active && (
                  <span
                    aria-hidden="true"
                    className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full bg-primary-600"
                  />
                )}
                <span className={`shrink-0 ${active ? 'text-primary-600' : 'text-neutral-500'}`}>
                  {item.icon}
                </span>
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {footer && <div className="border-t border-neutral-200 p-3 shrink-0">{footer}</div>}
      </aside>
    </>
  );
}
