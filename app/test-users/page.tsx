'use client';

import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Card from '@/components/Card';
import Button from '@/components/Button';
import { User, Building, Shield, ShoppingCart, Package, TrendingUp } from 'lucide-react';

export default function TestUsersPage() {
  const router = useRouter();

  const testUsers = [
    {
      id: 'buyer-starter',
      name: 'Comprador - Plano Starter',
      role: 'buyer',
      plan: 'Starter',
      email: 'comprador.starter@teste.com',
      description: 'Empresa pequena com 3 usuários, 20 requisições/mês',
      icon: ShoppingCart,
      color: 'primary',
      features: [
        '3 usuários',
        '20 requisições/mês',
        'Raio de 20km',
        '3 categorias',
      ],
      dashboardUrl: '/buyer/dashboard',
    },
    {
      id: 'buyer-growth',
      name: 'Comprador - Plano Growth',
      role: 'buyer',
      plan: 'Growth',
      email: 'comprador.growth@teste.com',
      description: 'Empresa em crescimento com 10 usuários, 200 requisições/mês',
      icon: ShoppingCart,
      color: 'success',
      features: [
        '10 usuários',
        '200 requisições/mês',
        'Raio de 50km',
        '10 categorias',
        'Export CSV',
      ],
      dashboardUrl: '/buyer/dashboard',
    },
    {
      id: 'buyer-enterprise',
      name: 'Comprador - Plano Enterprise',
      role: 'buyer',
      plan: 'Enterprise',
      email: 'comprador.enterprise@teste.com',
      description: 'Grande empresa com recursos ilimitados',
      icon: ShoppingCart,
      color: 'secondary',
      features: [
        'Usuários ilimitados',
        'Requisições ilimitadas',
        'Raio ilimitado',
        'Todas as categorias',
        'API integrada',
      ],
      dashboardUrl: '/buyer/dashboard',
    },
    {
      id: 'seller-starter',
      name: 'Vendedor - Plano Starter',
      role: 'seller',
      plan: 'Starter',
      email: 'vendedor.starter@teste.com',
      description: 'Fornecedor pequeno com 3 usuários, 100 propostas/mês',
      icon: Package,
      color: 'primary',
      features: [
        '3 usuários',
        '100 propostas/mês',
        'Raio de 20km',
        '3 categorias',
      ],
      dashboardUrl: '/seller/dashboard',
    },
    {
      id: 'seller-growth',
      name: 'Vendedor - Plano Growth',
      role: 'seller',
      plan: 'Growth',
      email: 'vendedor.growth@teste.com',
      description: 'Fornecedor em crescimento com 10 usuários, 1000 propostas/mês',
      icon: Package,
      color: 'success',
      features: [
        '10 usuários',
        '1.000 propostas/mês',
        'Raio de 50km',
        '10 categorias',
        'Export CSV',
      ],
      dashboardUrl: '/seller/dashboard',
    },
    {
      id: 'seller-enterprise',
      name: 'Vendedor - Plano Enterprise',
      role: 'seller',
      plan: 'Enterprise',
      email: 'vendedor.enterprise@teste.com',
      description: 'Grande fornecedor com recursos ilimitados',
      icon: Package,
      color: 'secondary',
      features: [
        'Usuários ilimitados',
        'Propostas ilimitadas',
        'Raio ilimitado',
        'Todas as categorias',
        'API integrada',
      ],
      dashboardUrl: '/seller/dashboard',
    },
    {
      id: 'admin',
      name: 'Administrador Geral',
      role: 'admin',
      plan: 'Sistema',
      email: 'admin@jada.com',
      description: 'Acesso completo ao painel administrativo',
      icon: Shield,
      color: 'warning',
      features: [
        'Gestão de empresas',
        'Gestão de planos',
        'Dashboard financeiro',
        'Logs e auditoria',
        'Suporte',
      ],
      dashboardUrl: '/admin/dashboard',
    },
  ];

  const handleSelectUser = (user: typeof testUsers[0]) => {
    // Simular login redirecionando para o dashboard
    router.push(user.dashboardUrl);
  };

  const getColorClasses = (color: string) => {
    const colors = {
      primary: 'border-primary-200 bg-primary-50 hover:bg-primary-100',
      success: 'border-success-200 bg-success-50 hover:bg-success-100',
      secondary: 'border-secondary-200 bg-secondary-50 hover:bg-secondary-100',
      warning: 'border-warning-200 bg-warning-50 hover:bg-warning-100',
    };
    return colors[color as keyof typeof colors] || colors.primary;
  };

  const getIconColor = (color: string) => {
    const colors = {
      primary: 'text-primary-600',
      success: 'text-success-600',
      secondary: 'text-secondary-600',
      warning: 'text-warning-600',
    };
    return colors[color as keyof typeof colors] || colors.primary;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Usuários de Teste
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Selecione um usuário de teste para navegar pela plataforma e testar diferentes planos e funcionalidades
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {testUsers.map((user) => {
              const Icon = user.icon;
              return (
                <Card
                  key={user.id}
                  className={`cursor-pointer transition-all hover:shadow-lg ${getColorClasses(user.color)}`}
                  onClick={() => handleSelectUser(user)}
                >
                  <div className="flex items-start space-x-4 mb-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getColorClasses(user.color)}`}>
                      <Icon className={`w-6 h-6 ${getIconColor(user.color)}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {user.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {user.description}
                      </p>
                      <span className="badge badge-info text-xs">
                        {user.plan}
                      </span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-xs font-semibold text-gray-700 mb-2">Recursos:</p>
                    <ul className="space-y-1">
                      {user.features.map((feature, index) => (
                        <li key={index} className="text-xs text-gray-600 flex items-center space-x-1">
                          <span className="text-success-600">✓</span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500 mb-2">
                      <strong>E-mail:</strong> {user.email}
                    </p>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectUser(user);
                      }}
                    >
                      Acessar Dashboard
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>

          <Card className="bg-blue-50 border-blue-200">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-bold">ℹ</span>
              </div>
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">
                  Como usar os usuários de teste
                </h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Clique em qualquer card acima para acessar o dashboard do usuário</li>
                  <li>• Cada usuário representa um plano diferente (Starter, Growth, Enterprise)</li>
                  <li>• Você pode navegar por todas as páginas e funcionalidades</li>
                  <li>• Os dados são simulados apenas para demonstração visual</li>
                  <li>• Use o menu superior para navegar entre as páginas de cada perfil</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}


