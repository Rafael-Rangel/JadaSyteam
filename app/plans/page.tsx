import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Button from '@/components/Button';
import Card from '@/components/Card';
import { Check, Star } from 'lucide-react';

export default function PlansPage() {
  const plans = [
    {
      name: 'Starter',
      price: 49,
      description: 'Ideal para empresas pequenas',
      popular: false,
      features: [
        '3 usuários por empresa',
        '20 requisições/mês (comprador)',
        '100 propostas/mês (vendedor)',
        'Raio padrão: 20km (configurável)',
        '3 categorias desbloqueadas',
        'Relatórios básicos',
        'Suporte por e-mail (48h)',
      ],
      limits: {
        users: 3,
        requests: 20,
        proposals: 100,
        radius: 20,
        categories: 3,
      },
    },
    {
      name: 'Growth',
      price: 199,
      description: 'Para empresas em crescimento',
      popular: true,
      features: [
        '10 usuários por empresa',
        '200 requisições/mês (comprador)',
        '1.000 propostas/mês (vendedor)',
        'Raio padrão: 50km (configurável)',
        '10 categorias desbloqueadas',
        'Destaque de requisição (limitado)',
        'Export CSV',
        'Integrações básicas de ERP',
        'Suporte e-mail + chat (horário comercial)',
      ],
      limits: {
        users: 10,
        requests: 200,
        proposals: 1000,
        radius: 50,
        categories: 10,
      },
    },
    {
      name: 'Enterprise',
      price: 799,
      description: 'Solução completa para grandes empresas',
      popular: false,
      features: [
        'Usuários ilimitados',
        'Requisições ilimitadas',
        'Propostas ilimitadas',
        'Raio ilimitado (configurável)',
        'Todas as categorias desbloqueadas',
        'Integração via API',
        'SSO/LDAP',
        'SLA de suporte',
        'Relatórios avançados',
        'Conta dedicada',
        'Suporte prioritário',
      ],
      limits: {
        users: 'Ilimitado',
        requests: 'Ilimitado',
        proposals: 'Ilimitado',
        radius: 'Ilimitado',
        categories: 'Todas',
      },
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Escolha o Plano Ideal
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Planos flexíveis para compradores, vendedores ou ambos. Escolha o que melhor se adapta à sua empresa.
            </p>
          </div>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={`relative ${plan.popular ? 'ring-2 ring-primary-600 scale-105' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary-600 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
                      <Star className="w-4 h-4" />
                      <span>Mais Popular</span>
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-4">{plan.description}</p>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-gray-900">R$ {plan.price}</span>
                    <span className="text-gray-600">/mês</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <Check className="w-5 h-5 text-success-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link href={`/signup?plan=${plan.name.toLowerCase()}`} className="block">
                  <Button
                    variant={plan.popular ? 'primary' : 'outline'}
                    className="w-full"
                    size="lg"
                  >
                    Assinar {plan.name}
                  </Button>
                </Link>
              </Card>
            ))}
          </div>

          {/* Additional Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
              Perguntas Frequentes sobre Planos
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Posso ser comprador e vendedor?</h3>
                <p className="text-gray-600">
                  Sim! Você pode escolher ser apenas comprador, apenas vendedor ou ambos. Os limites se aplicam conforme o tipo de uso.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Posso mudar de plano depois?</h3>
                <p className="text-gray-600">
                  Sim, você pode fazer upgrade ou downgrade a qualquer momento. As alterações são aplicadas no próximo ciclo de cobrança.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">O que acontece se eu exceder os limites?</h3>
                <p className="text-gray-600">
                  Você receberá uma notificação e poderá fazer upgrade de plano ou comprar pacotes adicionais.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Há período de teste?</h3>
                <p className="text-gray-600">
                  Oferecemos período de teste de 7 dias para você conhecer a plataforma antes de assinar.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}



