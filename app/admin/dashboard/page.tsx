import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Card from '@/components/Card';
import { Building, Users, Package, TrendingUp, DollarSign, AlertCircle } from 'lucide-react';

export default function AdminDashboard() {
  const stats = [
    { label: 'Total de Empresas', value: '245', icon: Building, color: 'primary', change: '+12%' },
    { label: 'Usuários Ativos', value: '1.234', icon: Users, color: 'success', change: '+8%' },
    { label: 'Requisições (mês)', value: '3.456', icon: Package, color: 'warning', change: '+15%' },
    { label: 'Propostas (mês)', value: '8.901', icon: TrendingUp, color: 'secondary', change: '+22%' },
    { label: 'Faturamento (mês)', value: 'R$ 48.750', icon: DollarSign, color: 'success', change: '+18%' },
    { label: 'Assinaturas Vencidas', value: '12', icon: AlertCircle, color: 'danger', change: '-5%' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header userType="admin" userName="Admin" />
      
      <main className="flex-grow py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Administrativo</h1>
            <p className="text-gray-600 mt-1">Visão geral da plataforma</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              const colorClasses = {
                primary: 'bg-primary-100 text-primary-600',
                success: 'bg-success-100 text-success-600',
                warning: 'bg-warning-100 text-warning-600',
                danger: 'bg-danger-100 text-danger-600',
                secondary: 'bg-secondary-100 text-secondary-600',
              };
              return (
                <Card key={index}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                      <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
                      <p className={`text-xs ${stat.change.startsWith('+') ? 'text-success-600' : 'text-danger-600'}`}>
                        {stat.change} vs mês anterior
                      </p>
                    </div>
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[stat.color as keyof typeof colorClasses]}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Empresas Recentes</h2>
              <div className="space-y-3">
                {[
                  { name: 'Empresa ABC', type: 'Comprador', plan: 'Growth', created: '2024-01-15' },
                  { name: 'Fornecedor XYZ', type: 'Vendedor', plan: 'Starter', created: '2024-01-14' },
                  { name: 'Construção Total', type: 'Ambos', plan: 'Enterprise', created: '2024-01-13' },
                ].map((company, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{company.name}</p>
                      <p className="text-sm text-gray-600">{company.type} • {company.plan}</p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(company.created).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Ações Necessárias</h2>
              <div className="space-y-3">
                <div className="p-3 bg-warning-50 border border-warning-200 rounded-lg">
                  <p className="font-medium text-warning-900 mb-1">12 Assinaturas Vencidas</p>
                  <p className="text-sm text-warning-700">Requerem atenção imediata</p>
                </div>
                <div className="p-3 bg-primary-50 border border-primary-200 rounded-lg">
                  <p className="font-medium text-primary-900 mb-1">5 Novas Empresas Aguardando</p>
                  <p className="text-sm text-primary-700">Aprovação pendente</p>
                </div>
                <div className="p-3 bg-success-50 border border-success-200 rounded-lg">
                  <p className="font-medium text-success-900 mb-1">3 Pagamentos Pendentes</p>
                  <p className="text-sm text-success-700">Aguardando confirmação</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}



