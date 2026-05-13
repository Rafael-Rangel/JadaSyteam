'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Badge from '@/components/ui/Badge';
import Skeleton from '@/components/ui/Skeleton';
import { CreditCard, Check, ArrowRight } from 'lucide-react';

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
  limits: { users: number; requestsPerMonth: number };
  usage: { users: number; requestsThisMonth: number };
};

const PLAN_FEATURES: Record<string, string[]> = {
  starter: ['3 usuários por empresa', '20 requisições/mês', 'Suporte por e-mail'],
  growth: ['10 usuários por empresa', '200 requisições/mês', 'Suporte prioritário'],
  enterprise: ['100 usuários por empresa', 'Requisições ilimitadas', 'Suporte dedicado'],
};

function billingTone(
  status: string | null | undefined
): 'success' | 'danger' | 'warning' {
  if (status === 'active') return 'success';
  if (status === 'past_due') return 'danger';
  return 'warning';
}

export default function SubscriptionPage() {
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
      <div className="space-y-4">
        <Skeleton height={36} width="30%" />
        <Skeleton height={220} />
      </div>
    );
  }

  if (!data) {
    return (
      <p className="text-sm text-neutral-600">Não foi possível carregar os dados da assinatura.</p>
    );
  }

  const features = PLAN_FEATURES[data.plan] ?? [
    `${data.limits.users} usuários`,
    `${data.limits.requestsPerMonth} requisições/mês`,
  ];
  const reqPct =
    data.limits.requestsPerMonth > 0
      ? Math.min(100, (data.usage.requestsThisMonth / data.limits.requestsPerMonth) * 100)
      : 0;
  const userPct =
    data.limits.users > 0 ? Math.min(100, (data.usage.users / data.limits.users) * 100) : 0;

  const statusLabel =
    data.billing?.status === 'active'
      ? 'Ativa'
      : data.billing?.status === 'past_due'
        ? 'Em atraso'
        : 'Pendente';

  return (
    <div>
      <PageHeader title="Assinatura" description="Plano, uso e cobrança." />

      <Card className="mb-6">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <h2 className="mb-2 text-2xl font-bold text-neutral-900">{data.planName}</h2>
            <Badge tone={billingTone(data.billing?.status)}>{statusLabel}</Badge>
          </div>
          <div className="text-left sm:text-right">
            <div className="text-3xl font-bold text-primary-600">
              R$ {data.planPrice}
              <span className="text-lg font-normal text-neutral-600">/mês</span>
            </div>
          </div>
        </div>

        <div className="border-t border-neutral-200 pt-6">
          <h3 className="mb-4 font-semibold text-neutral-900">Recursos inclusos</h3>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2">
                <Check className="h-5 w-5 shrink-0 text-success-600" />
                <span className="text-neutral-700">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Card className="mb-6">
        <h2 className="mb-6 text-lg font-semibold text-neutral-900">Uso do plano</h2>
        <div className="space-y-4">
          <div>
            <div className="mb-2 flex justify-between text-sm">
              <span className="text-neutral-600">Requisições (este mês)</span>
              <span className="font-semibold text-neutral-900">
                {data.usage.requestsThisMonth} /{' '}
                {data.limits.requestsPerMonth < 99999 ? data.limits.requestsPerMonth : 'ilimitado'}
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-neutral-200">
              <div className="h-2 rounded-full bg-primary-600" style={{ width: `${reqPct}%` }} />
            </div>
          </div>
          <div>
            <div className="mb-2 flex justify-between text-sm">
              <span className="text-neutral-600">Usuários</span>
              <span className="font-semibold text-neutral-900">
                {data.usage.users} / {data.limits.users}
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-neutral-200">
              <div className="h-2 rounded-full bg-warning-600" style={{ width: `${userPct}%` }} />
            </div>
          </div>
        </div>
      </Card>

      <Card className="mb-6">
        <h2 className="mb-6 text-lg font-semibold text-neutral-900">Pagamento (Asaas)</h2>
        <div className="space-y-3 rounded-lg border border-neutral-200 bg-neutral-50 p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <CreditCard className="h-8 w-8 text-neutral-400" />
              <div>
                <p className="font-medium text-neutral-900">Cobrança via Asaas</p>
                <p className="text-sm text-neutral-600">
                  {data.billing?.subscriptionId
                    ? `Assinatura: ${data.billing.subscriptionId}`
                    : 'Nenhuma assinatura ativa no provedor ainda.'}
                  {data.billing?.nextDueDate
                    ? ` · Próximo vencimento: ${new Date(data.billing.nextDueDate).toLocaleDateString('pt-BR')}`
                    : ''}
                </p>
              </div>
            </div>
          </div>

          {payError && <p className="text-sm text-danger-700">{payError}</p>}
          {payLink && (
            <p className="text-sm">
              Link da cobrança:{' '}
              <a className="font-medium text-primary-600 underline" href={payLink} target="_blank" rel="noreferrer">
                abrir
              </a>
            </p>
          )}

          <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
            <select className="input" value={period} onChange={(e) => setPeriod(e.target.value as typeof period)}>
              <option value="monthly">Mensal</option>
              <option value="semiannually">6 meses</option>
              <option value="yearly">Anual</option>
            </select>
            <select
              className="input"
              value={billingType}
              onChange={(e) => setBillingType(e.target.value as typeof billingType)}
            >
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

      <div className="flex flex-col gap-4 sm:flex-row">
        <Link href="/plans" className="flex-1">
          <Button variant="outline" className="w-full">
            Ver planos
            <ArrowRight className="ml-2 inline h-4 w-4" />
          </Button>
        </Link>
        <Button variant="danger" className="flex-1" disabled title="Entre em contato para cancelar">
          Cancelar assinatura
        </Button>
      </div>
    </div>
  );
}
