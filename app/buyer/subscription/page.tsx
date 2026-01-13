'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Card from '@/components/Card';
import Button from '@/components/Button';
import { CreditCard, Calendar, Check, AlertCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function SubscriptionPage() {
  const currentPlan = {
    name: 'Growth',
    price: 199,
    status: 'active',
    nextBilling: '2024-02-15',
    cardLast4: '4242',
    features: [
      '10 usuários por empresa',
      '200 requisições/mês',
      '1.000 propostas/mês',
      'Raio padrão: 50km',
      '10 categorias desbloqueadas',
    ],
  };

  const usage = {
    requests: { used: 45, limit: 200 },
    proposals: { used: 320, limit: 1000 },
    users: { used: 8, limit: 10 },
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header userType="buyer" userName="João Silva" />
      
      <main className="flex-grow py-8 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Assinatura</h1>

          {/* Current Plan */}
          <Card className="mb-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{currentPlan.name}</h2>
                <div className="flex items-center space-x-2">
                  <span className="badge badge-success">Ativa</span>
                  <span className="text-sm text-gray-600">
                    Próxima cobrança: {new Date(currentPlan.nextBilling).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-primary-600">
                  R$ {currentPlan.price}
                  <span className="text-lg text-gray-600 font-normal">/mês</span>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="font-semibold text-gray-900 mb-4">Recursos Inclusos</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {currentPlan.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Check className="w-5 h-5 text-success-600" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Usage */}
          <Card className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Uso do Plano</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Requisições</span>
                  <span className="font-semibold text-gray-900">
                    {usage.requests.used} / {usage.requests.limit}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full"
                    style={{ width: `${(usage.requests.used / usage.requests.limit) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Propostas</span>
                  <span className="font-semibold text-gray-900">
                    {usage.proposals.used} / {usage.proposals.limit}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-success-600 h-2 rounded-full"
                    style={{ width: `${(usage.proposals.used / usage.proposals.limit) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Usuários</span>
                  <span className="font-semibold text-gray-900">
                    {usage.users.used} / {usage.users.limit}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-warning-600 h-2 rounded-full"
                    style={{ width: `${(usage.users.used / usage.users.limit) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </Card>

          {/* Payment Method */}
          <Card className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Método de Pagamento</h2>
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <CreditCard className="w-8 h-8 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">Cartão terminado em {currentPlan.cardLast4}</p>
                  <p className="text-sm text-gray-600">Vencimento em {new Date(currentPlan.nextBilling).toLocaleDateString('pt-BR')}</p>
                </div>
              </div>
              <Button variant="outline">Alterar</Button>
            </div>
          </Card>

          {/* Actions */}
          <div className="flex space-x-4">
            <Link href="/plans" className="flex-1">
              <Button variant="outline" className="w-full">
                Alterar Plano
                <ArrowRight className="w-4 h-4 ml-2 inline" />
              </Button>
            </Link>
            <Button variant="danger" className="flex-1">
              Cancelar Assinatura
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}



