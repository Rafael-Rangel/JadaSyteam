'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { Menu, X, ShoppingCart, Package, Settings, LogOut, User } from 'lucide-react';

interface HeaderProps {
  userType?: 'buyer' | 'seller' | 'admin' | null;
  userName?: string;
}

export default function Header({ userType: propUserType = null, userName: propUserName }: HeaderProps) {
  const { data: session, status } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const pathname = usePathname();

  const companyType = (session?.user as { companyType?: string })?.companyType;
  const role = (session?.user as { role?: string })?.role;
  const userName = propUserName ?? session?.user?.name ?? null;
  const derivedType: 'buyer' | 'seller' | 'admin' | null =
    propUserType ??
    (role === 'admin'
      ? 'admin'
      : companyType === 'buyer'
        ? 'buyer'
        : companyType === 'seller'
          ? 'seller'
          : companyType === 'both'
            ? pathname.startsWith('/seller')
              ? 'seller'
              : 'buyer'
            : null);
  const userType = status === 'loading' ? null : derivedType;

  const isPublicPage = !userType;

  const buyerLinks = [
    { href: '/buyer/dashboard', label: 'Dashboard', icon: ShoppingCart },
    { href: '/buyer/requests', label: 'Minhas Requisições', icon: Package },
    { href: '/buyer/create-request', label: 'Nova Requisição', icon: Package },
    { href: '/buyer/users', label: 'Usuários', icon: User },
    { href: '/buyer/profile', label: 'Perfil', icon: Settings },
  ];

  const sellerLinks = [
    { href: '/seller/dashboard', label: 'Dashboard', icon: Package },
    { href: '/seller/opportunities', label: 'Oportunidades', icon: ShoppingCart },
    { href: '/seller/proposals', label: 'Minhas Propostas', icon: Package },
    { href: '/seller/settings', label: 'Configurações', icon: Settings },
    { href: '/seller/users', label: 'Usuários', icon: User },
  ];

  const adminLinks = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: Settings },
    { href: '/admin/companies', label: 'Empresas', icon: Package },
    { href: '/admin/users', label: 'Equipe JADA', icon: User },
    { href: '/admin/plans', label: 'Planos', icon: Settings },
    { href: '/admin/financial', label: 'Financeiro', icon: Settings },
  ];

  const links = userType === 'buyer' ? buyerLinks : userType === 'seller' ? sellerLinks : userType === 'admin' ? adminLinks : [];

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white/90 shadow-sm backdrop-blur">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Image
                src="/logo.jpg"
                alt="JADA"
                width={40}
                height={40}
                className="h-10 w-auto object-contain"
                priority
              />
              <span className="text-xl font-bold text-neutral-900 hidden sm:inline">JADA</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          {!isPublicPage && (
            <div className="hidden md:flex items-center space-x-1">
              {links.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center space-x-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-neutral-700 hover:bg-neutral-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Public Navigation */}
          {isPublicPage && (
            <div className="hidden md:flex items-center space-x-6">
              <Link href="/plans" className="text-neutral-700 hover:text-primary-600 font-medium">
                Planos
              </Link>
              <Link href="/about" className="text-neutral-700 hover:text-primary-600 font-medium">
                Sobre
              </Link>
              <Link href="/faq" className="text-neutral-700 hover:text-primary-600 font-medium">
                FAQ
              </Link>
            </div>
          )}

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            {isPublicPage ? (
              <>
                <Link
                  href="/login"
                  className="hidden md:block text-neutral-700 hover:text-primary-600 font-medium"
                >
                  Entrar
                </Link>
                <Link
                  href="/signup"
                  className="btn btn-primary btn-md shrink-0 touch-manipulation"
                >
                  Criar Conta
                </Link>
              </>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  type="button"
                  className="flex min-h-11 touch-manipulation items-center space-x-2 rounded-lg px-2 py-1.5 hover:bg-neutral-100 md:min-h-0 md:px-3"
                >
                  <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {userName?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <span className="hidden md:block text-sm font-medium text-neutral-700">
                    {userName || 'Usuário'}
                  </span>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-neutral-200 py-1 z-50">
                    <Link
                      href={userType === 'buyer' ? '/buyer/profile' : userType === 'seller' ? '/seller/profile' : '/admin/profile'}
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <User className="w-4 h-4" />
                      <span>Meu Perfil</span>
                    </Link>
                    <Link
                      href={userType === 'buyer' ? '/buyer/subscription' : userType === 'seller' ? '/seller/subscription' : '#'}
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <Settings className="w-4 h-4" />
                      <span>Assinatura</span>
                    </Link>
                    <div className="border-t border-neutral-200 my-1"></div>
                    <button
                      type="button"
                      className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-danger-600 hover:bg-neutral-100"
                      onClick={() => { setUserMenuOpen(false); signOut({ callbackUrl: '/' }); }}
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sair</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Mobile menu button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
              aria-expanded={mobileMenuOpen}
              aria-controls="header-mobile-nav"
              className="inline-flex h-11 w-11 touch-manipulation items-center justify-center rounded-lg text-neutral-700 hover:bg-neutral-100 md:hidden"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Menu mobile: público (Planos, Sobre, FAQ, Entrar) ou área logada */}
        {mobileMenuOpen && (
          <div id="header-mobile-nav" className="border-t border-neutral-200 py-2 md:hidden">
            {isPublicPage ? (
              <div className="flex flex-col gap-0.5">
                <Link
                  href="/plans"
                  className="flex min-h-11 items-center rounded-lg px-4 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Planos
                </Link>
                <Link
                  href="/about"
                  className="flex min-h-11 items-center rounded-lg px-4 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sobre
                </Link>
                <Link
                  href="/faq"
                  className="flex min-h-11 items-center rounded-lg px-4 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  FAQ
                </Link>
                <Link
                  href="/contact"
                  className="flex min-h-11 items-center rounded-lg px-4 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Contato
                </Link>
                <div className="my-2 border-t border-neutral-100" />
                <Link
                  href="/login"
                  className="flex min-h-11 items-center rounded-lg px-4 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Entrar
                </Link>
                <Link
                  href="/signup"
                  className="btn btn-primary mx-4 mt-1 min-h-11 justify-center touch-manipulation"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Criar conta
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-0.5">
                {links.map((link) => {
                  const Icon = link.icon;
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex min-h-11 items-center space-x-3 rounded-lg px-4 text-sm font-medium ${
                        isActive
                          ? 'bg-primary-50 text-primary-700'
                          : 'text-neutral-700 hover:bg-neutral-100'
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span>{link.label}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}


