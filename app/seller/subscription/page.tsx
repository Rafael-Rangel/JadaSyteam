'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Card from '@/components/Card';
import Button from '@/components/Button';
import { CreditCard, Check, ArrowRight } from 'lucide-react';
import Link from 'next/link';

type SubscriptionData = {
  plan: string;
  planName: string;
  planPrice: number;
  billing?: {
    provider?: string | null;
    status?: string | null;
    cycle?: string | null;
    nextDueDate?: string | null;
    subscriptionId?: string | null;
  };
  limits: { users: number; requestsPerMonth: number; proposalsPerMonth: number };
  usage: { users: number; requestsThisMonth: number; proposalsThisMonth: number };
};

const PLAN_FEATURES_SELLER: Record<string, string[]> = {
  starter: ['3 usuários por empresa', '100 propostas/mês', 'Suporte por e-mail'],
  growth: ['10 usuários por empresa', '1.000 propostas/mês', 'Suporte prioritário'],
  enterprise: ['100 usuários por empresa', 'Propostas ilimitadas', 'Suporte dedicado'],
};

export default function SellerSubscriptionPage() {
  const [data, setData] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const [payLink, setPayLink] = useState<string | null>(null);
  const [period, setPeriod] = useState<'monthly' | 'semiannually' | 'yearly'>('monthly');
  const [billingType, setBillingType] = useState<'PIX' | 'BOLETO' | 'CREDIT_CARD'>('PIX');

  useEffect(() => {
    fetch('/api/company/subscription')
      .then((res) => (res.ok ? res.json() : null))
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleStartPayment = async () => {
    setPayError(null);
    setPayLink(null);
    setPaying(true);
    try {
      const res = await fetch('/api/billing/asaas/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ period, billingType }),
      });
      const out = await res.json().catch(() => ({}));
      if (!res.ok) {
        setPayError(out.error || 'Erro ao criar cobrança.');
        setPaying(false);
        return;
      }
      const link = out?.payment?.invoiceUrl || out?.payment?.bankSlipUrl || null;
      setPayLink(link);
      fetch('/api/company/subscription')
        .then((r) => (r.ok ? r.json() : null))
        .then(setData)
        .catch(() => {});
    } catch {
      setPayError('Erro ao iniciar cobrança.');
    }
    setPaying(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header userType="seller" />
        <main className="flex-grow py-8 bg-gray-50 flex items-center justify-center">
          <p className="text-gray-600">Carregando...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header userType="seller" />
        <main className="flex-grow py-8 bg-gray-50 flex items-center justify-center">
          <p className="text-gray-600">Não foi possível carregar os dados da assinatura.</p>
        </main>
        <Footer />
      </div>
    );
  }

  const features = PLAN_FEATURES_SELLER[data.plan] ?? [
    `${data.limits.users} usuários`,
    `${data.limits.proposalsPerMonth} propostas/mês`,
  ];
  const proposalsLimit = data.limits.proposalsPerMonth;
  const propPct =
    proposalsLimit > 0 ? Math.min(100, (data.usage.proposalsThisMonth / proposalsLimit) * 100) : 0;
  const userPct =
    data.limits.users > 0 ? Math.min(100, (data.usage.users / data.limits.users) * 100) : 0;

  const proposalsLabel =
    proposalsLimit >= 99999 ? 'ilimitado' : proposalsLimit;

  return (
    <div className="min-h-screen flex flex-col">
      <Header userType="seller" />

      <main className="flex-grow py-8 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Assinatura</h1>

          <Card className="mb-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{data.planName}</h2>
                <div className="flex items-center space-x-2">
                  <span className={`badge ${data.billing?.status === 'active' ? 'badge-success' : data.billing?.status === 'past_due' ? 'badge-danger' : 'badge-warning'}`}>
                    {data.billing?.status === 'active' ? 'Ativa' : data.billing?.status === 'past_due' ? 'Em atraso' : 'Pendente'}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-primary-600">
                  R$ {data.planPrice}
                  <span className="text-lg text-gray-600 font-normal">/mês</span>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="font-semibold text-gray-900 mb-4">Recursos Inclusos</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Check className="w-5 h-5 text-success-600 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Card className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Uso do Plano</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Propostas (este mês)</span>
                  <span className="font-semibold text-gray-900">
                    {data.usage.proposalsThisMonth} / {proposalsLabel}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full"
                    style={{ width: `${propPct}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Usuários</span>
                  <span className="font-semibold text-gray-900">
                    {data.usage.users} / {data.limits.users}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-warning-600 h-2 rounded-full"
                    style={{ width: `${userPct}%` }}
                  />
                </div>
              </div>
            </div>
          </Card>

          <Card className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Método de Pagamento</h2>
            <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 space-y-3">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center space-x-3">
                  <CreditCard className="w-8 h-8 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">Cobrança via Asaas</p>
                    <p className="text-sm text-gray-600">
                      {data.billing?.subscriptionId ? `Assinatura: ${data.billing.subscriptionId}` : 'Nenhuma assinatura ativa no provedor ainda.'}
                      {data.billing?.nextDueDate ? ` · Próximo vencimento: ${new Date(data.billing.nextDueDate).toLocaleDateString('pt-BR')}` : ''}
                    </p>
                  </div>
                </div>
              </div>

              {payError && <p className="text-sm text-danger-700">{payError}</p>}
              {payLink && (
                <p className="text-sm">
                  Link da cobrança: <a className="text-primary-600 underline" href={payLink} target="_blank" rel="noreferrer">abrir</a>
                </p>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <select className="input" value={period} onChange={(e) => setPeriod(e.target.value as any)}>
                  <option value="monthly">Mensal</option>
                  <option value="semiannually">6 meses</option>
                  <option value="yearly">Anual</option>
                </select>
                <select className="input" value={billingType} onChange={(e) => setBillingType(e.target.value as any)}>
                  <option value="PIX">PIX</option>
                  <option value="BOLETO">Boleto</option>
                  <option value="CREDIT_CARD">Cartão de crédito</option>
                </select>
                <Button onClick={handleStartPayment} isLoading={paying}>
                  Gerar cobrança
                </Button>
              </div>
            </div>
          </Card>

          <div className="flex space-x-4">
            <Link href="/plans" className="flex-1">
              <Button variant="outline" className="w-full">
                Ver Planos
                <ArrowRight className="w-4 h-4 ml-2 inline" />
              </Button>
            </Link>
            <Button
              variant="danger"
              className="flex-1"
              disabled
              title="Entre em contato para cancelar"
            >
              Cancelar Assinatura
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
