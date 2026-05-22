'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Badge from '@/components/ui/Badge';
import Skeleton from '@/components/ui/Skeleton';
import { Check, ArrowRight, ExternalLink, Copy, Loader2 } from 'lucide-react';

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
    canManageBilling?: boolean;
    isAssistantOperator?: boolean;
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
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentLink, setPaymentLink] = useState<string | null>(null);
  const [billingBusy, setBillingBusy] = useState(false);
  const [billingMsg, setBillingMsg] = useState<string | null>(null);
  const [billingErr, setBillingErr] = useState<string | null>(null);
  const [methodType, setMethodType] = useState('BOLETO');
  const [methodPeriod, setMethodPeriod] = useState('monthly');

  const reload = () => {
    Promise.all([
      fetch('/api/company/subscription').then((r) => (r.ok ? r.json() : null)),
      fetch('/api/company/subscription/payments').then((r) => (r.ok ? r.json() : { payments: [] })),
    ])
      .then(([sub, pay]) => {
        setData(sub);
        setPayments(pay?.payments ?? []);
        const pref = sub?.billing?.preferredBillingType;
        if (pref) setMethodType(String(pref).toUpperCase());
        const per = sub?.billing?.preferredBillingPeriod;
        if (per) setMethodPeriod(String(per));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    reload();
  }, []);

  useEffect(() => {
    if (!data?.access?.canManageBilling) return;
    fetch('/api/company/payment-link')
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => setPaymentLink(json?.paymentLink ?? null))
      .catch(() => null);
  }, [data?.access?.canManageBilling, data?.billing?.status]);

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

  const inGrace = data.access?.shellState === 'grace';
  const canManageBilling = data.access?.canManageBilling === true;
  const isPending =
    data.billing?.status !== 'active' || data.access?.shellState === 'awaiting' || data.access?.shellState === 'grace';

  async function copyPaymentLink() {
    const link =
      paymentLink ||
      payments.find((p) => p.invoiceUrl || p.bankSlipUrl)?.invoiceUrl ||
      payments.find((p) => p.invoiceUrl || p.bankSlipUrl)?.bankSlipUrl;
    if (!link) {
      setBillingErr('Nenhum link de pagamento disponível. Emita ou atualize a cobrança.');
      return;
    }
    await navigator.clipboard.writeText(link);
    setBillingMsg('Link copiado para a área de transferência.');
    setBillingErr(null);
  }

  async function issuePayment() {
    setBillingBusy(true);
    setBillingMsg(null);
    setBillingErr(null);
    try {
      const res = await fetch('/api/company/billing/issue-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ billingType: methodType, period: methodPeriod }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setBillingErr(json.error || 'Não foi possível emitir a cobrança.');
        return;
      }
      if (json.paymentLink) setPaymentLink(json.paymentLink);
      setBillingMsg(
        json.alreadyExists
          ? 'Cobrança já existente — link atualizado abaixo.'
          : 'Cobrança emitida com sucesso.'
      );
      reload();
    } catch {
      setBillingErr('Erro de rede ao emitir cobrança.');
    } finally {
      setBillingBusy(false);
    }
  }

  async function savePaymentMethod() {
    setBillingBusy(true);
    setBillingMsg(null);
    setBillingErr(null);
    try {
      const res = await fetch('/api/company/payment-method', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ billingType: methodType, period: methodPeriod }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setBillingErr(json.error || 'Não foi possível alterar a forma de pagamento.');
        return;
      }
      setBillingMsg('Forma de pagamento atualizada. Se necessário, emita a cobrança novamente.');
      reload();
    } catch {
      setBillingErr('Erro de rede ao salvar forma de pagamento.');
    } finally {
      setBillingBusy(false);
    }
  }

  return (
    <div>
      <PageHeader title="Assinatura" description="Plano, uso e histórico de pagamentos." />

      {data.access?.isAssistantOperator && (
        <div className="mb-4 rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-950">
          Modo suporte JADA: você pode ver o status de pagamento, emitir cobrança e alterar a forma de
          pagamento desta empresa. As ações ficam registradas em auditoria.
        </div>
      )}

      {inGrace && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          Pagamento em tolerância: funções de negócio ficam bloqueadas até a regularização. Use os links de
          boleto ou fatura na tabela do histórico de cobranças (Asaas), quando disponíveis.
        </div>
      )}

      {canManageBilling && isPending && (
        <Card className="mb-6 border-primary-200 bg-primary-50/40">
          <h2 className="mb-2 text-lg font-semibold text-neutral-900">Pagamento pendente</h2>
          <p className="mb-4 text-sm text-neutral-700">
            Status atual: <strong>{statusLabel}</strong>. Envie o link abaixo ao cliente ou emita uma nova
            cobrança após ajustar o método.
          </p>
          {paymentLink && (
            <p className="mb-3 break-all text-sm text-neutral-800">
              <span className="font-medium">Link:</span>{' '}
              <a href={paymentLink} target="_blank" rel="noopener noreferrer" className="text-primary-600">
                {paymentLink}
              </a>
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={copyPaymentLink} disabled={billingBusy}>
              <Copy className="mr-2 h-4 w-4" />
              Copiar link
            </Button>
            {paymentLink && (
              <a href={paymentLink} target="_blank" rel="noopener noreferrer">
                <Button variant="outline">
                  Abrir pagamento <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </a>
            )}
            <Button onClick={issuePayment} disabled={billingBusy}>
              {billingBusy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Emitir / atualizar cobrança
            </Button>
          </div>
        </Card>
      )}

      {canManageBilling && (
        <Card className="mb-6">
          <h2 className="mb-4 text-lg font-semibold text-neutral-900">Forma de pagamento</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-1 block text-neutral-600">Método</span>
              <select
                className="w-full rounded-lg border border-neutral-300 px-3 py-2"
                value={methodType}
                onChange={(e) => setMethodType(e.target.value)}
              >
                <option value="PIX">PIX</option>
                <option value="BOLETO">Boleto</option>
                <option value="CREDIT_CARD">Cartão (link Asaas)</option>
              </select>
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-neutral-600">Periodicidade</span>
              <select
                className="w-full rounded-lg border border-neutral-300 px-3 py-2"
                value={methodPeriod}
                onChange={(e) => setMethodPeriod(e.target.value)}
              >
                <option value="monthly">Mensal</option>
                <option value="semiannually">Semestral</option>
                <option value="yearly">Anual</option>
              </select>
            </label>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="outline" onClick={savePaymentMethod} disabled={billingBusy}>
              Salvar forma de pagamento
            </Button>
          </div>
          {(billingMsg || billingErr) && (
            <p
              className={`mt-3 text-sm ${billingErr ? 'text-red-700' : 'text-emerald-800'}`}
              role="status"
            >
              {billingErr || billingMsg}
            </p>
          )}
        </Card>
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

      <div className="flex flex-col gap-4 sm:flex-row">
        <Link href="/plans" className="flex-1">
          <Button variant="outline" className="w-full">
            Ver página pública de planos
            <ArrowRight className="ml-2 inline h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
