'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Link from 'next/link';
import { Package, TrendingUp, CheckCircle, Clock, Eye } from 'lucide-react';

type OpportunityItem = {
  id: string;
  title: string;
  description?: string;
  buyer: string;
  category: string;
  city: string;
  state: string;
  deliveryDate: string;
  created: string;
  hasProposal: boolean;
};

type ProposalItem = {
  id: string;
  requestId: string;
  title: string;
  buyer: string;
  price: string;
  deliveryDays: string;
  status: string;
  createdAt: string;
};

type CompanyData = { verificationStatus?: string };

export default function SellerDashboard() {
  const { data: session } = useSession();
  const [opportunities, setOpportunities] = useState<OpportunityItem[]>([]);
  const [proposals, setProposals] = useState<ProposalItem[]>([]);
  const [company, setCompany] = useState<CompanyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/requests').then((r) => (r.ok ? r.json() : [])),
      fetch('/api/proposals').then((r) => (r.ok ? r.json() : [])),
      fetch('/api/company').then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([opps, props, comp]) => {
        setOpportunities(opps);
        setProposals(props);
        setCompany(comp ?? null);
      })
      .catch(() => setError('Não foi possível carregar os dados.'))
      .finally(() => setLoading(false));
  }, []);

  const newOpps = opportunities.filter((o) => !o.hasProposal);
  const accepted = proposals.filter((p) => p.status === 'accepted');
  const pending = proposals.filter((p) => p.status === 'sent' || p.status === 'viewed');

  const stats = [
    { label: 'Oportunidades Novas', value: String(newOpps.length), icon: Package, color: 'primary' },
    { label: 'Propostas Enviadas', value: String(proposals.length), icon: TrendingUp, color: 'success' },
    { label: 'Propostas Aceitas', value: String(accepted.length), icon: CheckCircle, color: 'success' },
    { label: 'Aguardando Resposta', value: String(pending.length), icon: Clock, color: 'warning' },
  ];

  const recentOpportunities = opportunities.slice(0, 5);
  const userName = session?.user?.name ?? null;

  return (
    <div className="min-h-screen flex flex-col">
      <Header userType="seller" userName={userName ?? undefined} />

      <main className="flex-grow py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center gap-4">
            <div className="hidden sm:block relative w-16 h-16 flex-shrink-0">
              <Image src="/mascote.png" alt="" role="presentation" fill className="object-contain" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Bem-vindo de volta, {userName || 'usuário'}!
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-danger-50 border border-danger-200 rounded-lg text-danger-800 text-sm">
              {error}
            </div>
          )}

          {company?.verificationStatus && company.verificationStatus !== 'approved' && (
            <div className="mb-6 p-4 rounded-lg text-sm bg-warning-50 border border-warning-200 text-warning-800">
              Sua empresa está em análise de CNPJ. Você não pode enviar propostas até a aprovação.
            </div>
          )}

          {loading ? (
            <p className="text-gray-600">Carregando...</p>
          ) : (
            <>
              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, index) => {
                  const Icon = stat.icon;
                  const colorClasses: Record<string, string> = {
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
                        <div
                          className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                            colorClasses[stat.color] ?? colorClasses.primary
                          }`}
                        >
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
                  <Link
                    href="/seller/opportunities"
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    Ver todas
                  </Link>
                </div>

                <div className="space-y-4">
                  {recentOpportunities.length === 0 ? (
                    <p className="text-gray-600 text-center py-8">Nenhuma oportunidade disponível</p>
                  ) : (
                    recentOpportunities.map((opportunity) => (
                      <div
                        key={opportunity.id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">{opportunity.title}</h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 flex-wrap gap-1">
                            <span>{opportunity.buyer}</span>
                            <span>•</span>
                            <span>{opportunity.category}</span>
                            <span>•</span>
                            <span>{opportunity.city} - {opportunity.state}</span>
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
                    ))
                  )}
                </div>
              </Card>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
