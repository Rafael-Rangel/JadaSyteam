'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Badge from '@/components/ui/Badge';
import Skeleton from '@/components/ui/Skeleton';
import Modal from '@/components/Modal';
import { Check, ArrowRight, ExternalLink } from 'lucide-react';

type PlanOption = { id: string; slug: string; name: string; price: number };

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
    preferredBillingType?: string | null;
    preferredBillingPeriod?: string | null;
  };
  access?: {
    shellState?: string;
    renewalEligible?: boolean;
    allowBusinessActions?: boolean;
    graceDaysRemaining?: number | null;
  };
  limits: { users: number; requestsPerMonth: number; proposalsPerMonth?: number };
  usage: { users: number; requestsThisMonth: number; proposalsThisMonth?: number };
};

type PaymentRow = {
  id: string;
  status: string;
  statusLabel: string;
  value: number;
  netValue: number | null;
  dueDate: string | null;
  paymentDate: string | null;
  billingTypeLabel: string;
  description: string | null;
  invoiceNumber: string | null;
  invoiceUrl: string | null;
  bankSlipUrl: string | null;
};

function billingTone(status: string | null | undefined): 'success' | 'danger' | 'warning' {
  if (status === 'active') return 'success';
  if (status === 'past_due') return 'danger';
  return 'warning';
}

function periodMultiplier(period: 'monthly' | 'semiannually' | 'yearly'): number {
  if (period === 'yearly') return 12;
  if (period === 'semiannually') return 6;
  return 1;
}

const PLAN_FEATURES: Record<string, string[]> = {
  starter: ['Usuários e requisições conforme o plano', 'Suporte por e-mail'],
  growth: ['Mais usuários e requisições', 'Suporte prioritário'],
  enterprise: ['Escala máxima', 'Suporte dedicado'],
};

function formatBrl(n: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n);
}

export default function SubscriptionPanel() {
  const [data, setData] = useState<SubscriptionData | null>(null);
  const [plans, setPlans] = useState<PlanOption[]>([]);
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [renewError, setRenewError] = useState<string | null>(null);
  const [renewing, setRenewing] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLink, setModalLink] = useState<string | null>(null);

  const [period, setPeriod] = useState<'monthly' | 'semiannually' | 'yearly'>('monthly');
  const [billingType, setBillingType] = useState<'PIX' | 'BOLETO' | 'CREDIT_CARD'>('PIX');
  const [planSlug, setPlanSlug] = useState<string>('');

  const reload = () => {
    Promise.all([
      fetch('/api/company/subscription').then((r) => (r.ok ? r.json() : null)),
      fetch('/api/plans').then((r) => (r.ok ? r.json() : [])),
      fetch('/api/company/subscription/payments').then((r) => (r.ok ? r.json() : { payments: [] })),
    ])
      .then(([sub, pls, pay]) => {
        setData(sub);
        setPlans(Array.isArray(pls) ? pls : []);
        setPayments(pay?.payments ?? []);
        if (sub?.plan) setPlanSlug((prev) => (prev ? prev : sub.plan));
        if (sub?.billing?.preferredBillingPeriod) {
          const p = sub.billing.preferredBillingPeriod;
          if (p === 'semiannually' || p === 'yearly' || p === 'monthly') setPeriod(p);
        }
        if (sub?.billing?.preferredBillingType) {
          const b = sub.billing.preferredBillingType;
          if (b === 'PIX' || b === 'BOLETO' || b === 'CREDIT_CARD') setBillingType(b);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    reload();
  }, []);

  const selectedPlan = useMemo(
    () => plans.find((p) => p.slug === planSlug) ?? null,
    [plans, planSlug]
  );

  const quotedTotal = useMemo(() => {
    if (!selectedPlan) return 0;
    return selectedPlan.price * periodMultiplier(period);
  }, [selectedPlan, period]);

  const renewalEligible = data?.access?.renewalEligible === true;
  const inGrace = data?.access?.shellState === 'grace';

  const handleRenew = async () => {
    setRenewError(null);
    if (!planSlug) {
      setRenewError('Selecione um plano.');
      return;
    }
    setRenewing(true);
    try {
      const res = await fetch('/api/company/subscription/renew', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planSlug, period, billingType }),
      });
      const out = await res.json().catch(() => ({}));
      if (!res.ok) {
        setRenewError(out.error || 'Não foi possível confirmar a renovação.');
        return;
      }
      const link = typeof out.paymentLink === 'string' ? out.paymentLink : null;
      setModalLink(link);
      setModalOpen(true);
      reload();
    } catch {
      setRenewError('Erro de rede ao confirmar.');
    }
    setRenewing(false);
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
      <PageHeader title="Assinatura" description="Plano, uso, histórico de pagamentos e renovação." />

      {inGrace && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          Pagamento em tolerância: funções de negócio ficam bloqueadas até a regularização. Use a renovação
          abaixo para gerar o link de pagamento com o plano desejado.
        </div>
      )}

      <Card className="mb-6">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <h2 className="mb-2 text-2xl font-bold text-neutral-900">{data.planName}</h2>
            <Badge tone={billingTone(data.billing?.status)}>{statusLabel}</Badge>
          </div>
          <div className="text-left sm:text-right">
            <div className="text-3xl font-bold text-primary-600">
              R$ {data.planPrice}
              <span className="text-lg font-normal text-neutral-600">/mês (referência)</span>
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
          {typeof data.limits.proposalsPerMonth === 'number' &&
            data.limits.proposalsPerMonth > 0 &&
            data.limits.proposalsPerMonth < 99999 && (
              <div>
                <div className="mb-2 flex justify-between text-sm">
                  <span className="text-neutral-600">Propostas (este mês)</span>
                  <span className="font-semibold text-neutral-900">
                    {data.usage.proposalsThisMonth ?? 0} / {data.limits.proposalsPerMonth}
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-neutral-200">
                  <div
                    className="h-2 rounded-full bg-emerald-600"
                    style={{
                      width: `${Math.min(
                        100,
                        ((data.usage.proposalsThisMonth ?? 0) / data.limits.proposalsPerMonth) * 100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            )}
        </div>
      </Card>

      <Card className="mb-6">
        <h2 className="mb-4 text-lg font-semibold text-neutral-900">Histórico de cobranças (Asaas)</h2>
        {!data.billing?.subscriptionId ? (
          <p className="text-sm text-neutral-600">
            Nenhuma assinatura no provedor ainda. A cobrança é emitida pela plataforma após a aprovação da
            empresa.
          </p>
        ) : payments.length === 0 ? (
          <p className="text-sm text-neutral-600">Nenhum pagamento listado ou dados ainda indisponíveis.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-neutral-200">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-neutral-100 text-neutral-700">
                <tr>
                  <th className="px-3 py-2 font-medium">Vencimento</th>
                  <th className="px-3 py-2 font-medium">Valor</th>
                  <th className="px-3 py-2 font-medium">Método</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="px-3 py-2 font-medium">Liquidação</th>
                  <th className="px-3 py-2 font-medium">Ação</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id} className="border-t border-neutral-100">
                    <td className="px-3 py-2 text-neutral-800">
                      {p.dueDate ? new Date(p.dueDate + 'T12:00:00').toLocaleDateString('pt-BR') : '—'}
                    </td>
                    <td className="px-3 py-2 font-medium">{formatBrl(p.value)}</td>
                    <td className="px-3 py-2">{p.billingTypeLabel}</td>
                    <td className="px-3 py-2">{p.statusLabel}</td>
                    <td className="px-3 py-2 text-neutral-600">
                      {p.paymentDate
                        ? new Date(p.paymentDate).toLocaleDateString('pt-BR')
                        : '—'}
                    </td>
                    <td className="px-3 py-2">
                      {p.invoiceUrl || p.bankSlipUrl ? (
                        <a
                          href={(p.invoiceUrl || p.bankSlipUrl) as string}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-600 font-medium inline-flex items-center gap-1"
                        >
                          Abrir <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      ) : (
                        '—'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card className="mb-6">
        <h2 className="mb-2 text-lg font-semibold text-neutral-900">Renovação e forma de pagamento</h2>
        <p className="mb-4 text-sm text-neutral-600">
          A emissão de novas cobranças é feita pela plataforma e pelo Asaas. Aqui você só confirma o plano, o
          período e o método <strong>na janela permitida</strong> (perto do vencimento ou em tolerância de
          pagamento).
        </p>

        {!renewalEligible ? (
          <p className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-700">
            Quando estiver disponível, esta seção permitirá revisar os planos e gerar o link de pagamento da
            renovação.
          </p>
        ) : (
          <div className="space-y-4">
            <div>
              <p className="mb-2 text-sm font-medium text-neutral-800">Plano</p>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {plans.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPlanSlug(p.slug)}
                    className={`rounded-lg border-2 px-3 py-2 text-left text-sm transition ${
                      planSlug === p.slug
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <span className="font-semibold text-neutral-900">{p.name}</span>
                    <span className="mt-1 block text-neutral-600">R$ {p.price}/mês ref.</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">Período</label>
                <select className="input w-full" value={period} onChange={(e) => setPeriod(e.target.value as typeof period)}>
                  <option value="monthly">Mensal</option>
                  <option value="semiannually">6 meses</option>
                  <option value="yearly">Anual</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">Forma de pagamento</label>
                <select
                  className="input w-full"
                  value={billingType}
                  onChange={(e) => setBillingType(e.target.value as typeof billingType)}
                >
                  <option value="PIX">PIX</option>
                  <option value="BOLETO">Boleto</option>
                  <option value="CREDIT_CARD">Cartão de crédito</option>
                </select>
              </div>
            </div>

            <div className="rounded-lg border border-primary-100 bg-primary-50/60 px-4 py-3">
              <p className="text-sm text-neutral-800">
                <span className="font-medium">Total estimado do período:</span>{' '}
                <span className="text-lg font-bold text-primary-700">{formatBrl(quotedTotal)}</span>
              </p>
              <p className="mt-1 text-xs text-neutral-600">
                Valor enviado ao Asaas conforme plano e período; confira o checkout final no link gerado.
              </p>
            </div>

            {renewError && <p className="text-sm text-danger-700">{renewError}</p>}

            <Button onClick={() => void handleRenew()} isLoading={renewing}>
              Confirmar renovação
            </Button>
          </div>
        )}
      </Card>

      <div className="flex flex-col gap-4 sm:flex-row">
        <Link href="/plans" className="flex-1">
          <Button variant="outline" className="w-full">
            Ver página pública de planos
            <ArrowRight className="ml-2 inline h-4 w-4" />
          </Button>
        </Link>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Link de pagamento"
        description="Use o link abaixo para concluir o pagamento no ambiente seguro do Asaas."
        footer={
          <Button variant="outline" onClick={() => setModalOpen(false)}>
            Fechar
          </Button>
        }
      >
        {modalLink ? (
          <a
            href={modalLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-primary-600 font-medium underline"
          >
            Abrir página de pagamento <ExternalLink className="h-4 w-4" />
          </a>
        ) : (
          <p className="text-sm text-neutral-600">
            Renovação registrada. Se o link não aparecer, atualize a página ou consulte o histórico acima.
          </p>
        )}
      </Modal>
    </div>
  );
}
