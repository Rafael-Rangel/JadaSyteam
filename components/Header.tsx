'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X, ShoppingCart, Package, Settings, LogOut, User } from 'lucide-react';

interface HeaderProps {
  userType?: 'buyer' | 'seller' | 'admin' | null;
  userName?: string;
}

export default function Header({ userType = null, userName }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const pathname = usePathname();

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
    { href: '/admin/plans', label: 'Planos', icon: Settings },
    { href: '/admin/financial', label: 'Financeiro', icon: Settings },
  ];

  const links = userType === 'buyer' ? buyerLinks : userType === 'seller' ? sellerLinks : userType === 'admin' ? adminLinks : [];

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">J</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Jada</span>
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
                        : 'text-gray-700 hover:bg-gray-100'
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
              <Link href="/plans" className="text-gray-700 hover:text-primary-600 font-medium">
                Planos
              </Link>
              <Link href="/test-users" className="text-gray-700 hover:text-primary-600 font-medium">
                Teste
              </Link>
              <Link href="/about" className="text-gray-700 hover:text-primary-600 font-medium">
                Sobre
              </Link>
              <Link href="/faq" className="text-gray-700 hover:text-primary-600 font-medium">
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
                  className="hidden md:block text-gray-700 hover:text-primary-600 font-medium"
                >
                  Entrar
                </Link>
                <Link
                  href="/signup"
                  className="btn btn-primary"
                >
                  Criar Conta
                </Link>
              </>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100"
                >
                  <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {userName?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <span className="hidden md:block text-sm font-medium text-gray-700">
                    {userName || 'Usuário'}
                  </span>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <Link
                      href={userType === 'buyer' ? '/buyer/profile' : userType === 'seller' ? '/seller/profile' : '/admin/profile'}
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <User className="w-4 h-4" />
                      <span>Meu Perfil</span>
                    </Link>
                    <Link
                      href={userType === 'buyer' ? '/buyer/subscription' : userType === 'seller' ? '/seller/subscription' : '#'}
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <Settings className="w-4 h-4" />
                      <span>Assinatura</span>
                    </Link>
                    <div className="border-t border-gray-200 my-1"></div>
                    <Link
                      href="/login"
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-danger-600 hover:bg-gray-100"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sair</span>
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && !isPublicPage && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-1">
              {links.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium ${
                      isActive
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}


