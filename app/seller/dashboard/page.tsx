import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Link from 'next/link';
import { Package, TrendingUp, CheckCircle, Clock, Eye } from 'lucide-react';

export default function SellerDashboard() {
  const stats = [
    { label: 'Oportunidades Novas', value: '15', icon: Package, color: 'primary' },
    { label: 'Propostas Enviadas', value: '32', icon: TrendingUp, color: 'success' },
    { label: 'Propostas Aceitas', value: '8', icon: CheckCircle, color: 'success' },
    { label: 'Aguardando Resposta', value: '12', icon: Clock, color: 'warning' },
  ];

  const recentOpportunities = [
    {
      id: 1,
      title: '600 parafusos M6',
      buyer: 'Empresa ABC',
      distance: '12 km',
      category: 'Construção',
      created: '2024-01-15',
    },
    {
      id: 2,
      title: '100 metros de cabo elétrico',
      buyer: 'Empresa XYZ',
      distance: '8 km',
      category: 'Elétrica',
      created: '2024-01-14',
    },
    {
      id: 3,
      title: '50 placas de madeira',
      buyer: 'Construção Total',
      distance: '15 km',
      category: 'Construção',
      created: '2024-01-13',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header userType="seller" userName="Maria Santos" />
      
      <main className="flex-grow py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Bem-vinda de volta, Maria!</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              const colorClasses = {
                primary: 'bg-primary-100 text-primary-600',
                success: 'bg-success-100 text-success-600',
                warning: 'bg-warning-100 text-warning-600',
                danger: 'bg-danger-100 text-danger-600',
              };
              return (
                <Card key={index}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[stat.color as keyof typeof colorClasses]}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Recent Opportunities */}
          <Card>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Oportunidades Recentes</h2>
              <Link href="/seller/opportunities" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                Ver todas
              </Link>
            </div>

            <div className="space-y-4">
              {recentOpportunities.map((opportunity) => (
                <div
                  key={opportunity.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{opportunity.title}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>{opportunity.buyer}</span>
                      <span>•</span>
                      <span>{opportunity.distance}</span>
                      <span>•</span>
                      <span>{opportunity.category}</span>
                      <span>•</span>
                      <span>Criada em {new Date(opportunity.created).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                  <Link href={`/seller/opportunities/${opportunity.id}`}>
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-1" />
                      Ver Oportunidade
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}



