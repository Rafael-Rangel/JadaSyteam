import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Link from 'next/link';
import { ShoppingCart, Package, TrendingUp, Clock, Plus, Eye } from 'lucide-react';

export default function BuyerDashboard() {
  const stats = [
    { label: 'Requisições Ativas', value: '12', icon: Package, color: 'primary' },
    { label: 'Propostas Recebidas', value: '45', icon: ShoppingCart, color: 'success' },
    { label: 'Requisições Restantes', value: '8/20', icon: TrendingUp, color: 'warning' },
    { label: 'Pendentes de Resposta', value: '5', icon: Clock, color: 'danger' },
  ];

  const recentRequests = [
    {
      id: 1,
      title: '600 parafusos M6',
      status: 'open',
      proposals: 8,
      created: '2024-01-15',
    },
    {
      id: 2,
      title: '100 metros de cabo elétrico',
      status: 'receiving',
      proposals: 12,
      created: '2024-01-14',
    },
    {
      id: 3,
      title: '50 placas de madeira',
      status: 'selected',
      proposals: 5,
      created: '2024-01-10',
    },
  ];

  const getStatusBadge = (status: string) => {
    const badges = {
      open: { label: 'Aberto', class: 'badge-info' },
      receiving: { label: 'Recebendo Propostas', class: 'badge-warning' },
      selected: { label: 'Proposta Aceita', class: 'badge-success' },
      closed: { label: 'Finalizado', class: 'badge' },
    };
    const badge = badges[status as keyof typeof badges] || badges.open;
    return <span className={`badge ${badge.class}`}>{badge.label}</span>;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header userType="buyer" userName="João Silva" />
      
      <main className="flex-grow py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-1">Bem-vindo de volta, João!</p>
            </div>
            <Link href="/buyer/create-request">
              <Button>
                <Plus className="w-5 h-5 mr-2 inline" />
                Nova Requisição
              </Button>
            </Link>
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

          {/* Recent Requests */}
          <Card>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Requisições Recentes</h2>
              <Link href="/buyer/requests" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                Ver todas
              </Link>
            </div>

            <div className="space-y-4">
              {recentRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{request.title}</h3>
                      {getStatusBadge(request.status)}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>{request.proposals} propostas recebidas</span>
                      <span>Criada em {new Date(request.created).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                  <Link href={`/buyer/requests/${request.id}`}>
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-1" />
                      Ver Detalhes
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



