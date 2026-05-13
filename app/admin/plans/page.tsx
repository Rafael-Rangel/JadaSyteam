'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Check, Plus, Pencil, Sparkles } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Modal from '@/components/Modal';
import Card from '@/components/Card';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';
import Skeleton from '@/components/ui/Skeleton';
import Tabs from '@/components/ui/Tabs';

type Plan = {
  id: string;
  slug: string;
  name: string;
  price: number;
  usersLimit: number;
  requestsPerMonthLimit: number;
  proposalsPerMonthLimit: number;
  description: string;
  features: string[];
  popular: boolean;
  active: boolean;
  sortOrder: number;
};

const emptyForm = {
  slug: '',
  name: '',
  price: 0,
  usersLimit: 0,
  requestsPerMonthLimit: 0,
  proposalsPerMonthLimit: 0,
  description: '',
  features: '',
  popular: false,
  active: true,
  sortOrder: 0,
};

type FormTab = 'general' | 'limits' | 'content';

const tabItems: { id: FormTab; label: string }[] = [
  { id: 'general', label: 'Geral' },
  { id: 'limits', label: 'Limites' },
  { id: 'content', label: 'Conteúdo' },
];

function formatLimit(n: number) {
  return n >= 99999 ? 'Ilimitado' : new Intl.NumberFormat('pt-BR').format(n);
}

function formatCurrency(v: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(v);
}

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState<'create' | Plan | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<FormTab>('general');

  const loadPlans = () => {
    setLoading(true);
    fetch('/api/admin/plans')
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then(setPlans)
      .catch(() => setPlans([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const openCreate = () => {
    setForm(emptyForm);
    setError('');
    setTab('general');
    setModalOpen('create');
  };

  const openEdit = (plan: Plan) => {
    setForm({
      slug: plan.slug,
      name: plan.name,
      price: plan.price,
      usersLimit: plan.usersLimit,
      requestsPerMonthLimit: plan.requestsPerMonthLimit,
      proposalsPerMonthLimit: plan.proposalsPerMonthLimit,
      description: plan.description,
      features: plan.features.join('\n'),
      popular: plan.popular,
      active: plan.active,
      sortOrder: plan.sortOrder,
    });
    setError('');
    setTab('general');
    setModalOpen(plan);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    const isCreate = modalOpen === 'create';
    const body = {
      name: form.name.trim(),
      price: Number(form.price) || 0,
      usersLimit: Number(form.usersLimit) || 0,
      requestsPerMonthLimit: Number(form.requestsPerMonthLimit) || 0,
      proposalsPerMonthLimit: Number(form.proposalsPerMonthLimit) || 0,
      description: form.description.trim() || undefined,
      features: form.features
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      popular: form.popular,
      active: form.active,
      sortOrder: Number(form.sortOrder) || 0,
    };

    const url = isCreate ? '/api/admin/plans' : `/api/admin/plans/${(modalOpen as Plan).id}`;
    const method = isCreate ? 'POST' : 'PATCH';
    const payload = isCreate ? { ...body, slug: form.slug.trim().toLowerCase() } : body;

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        return { status: res.status, data };
      })
      .then(({ status, data }) => {
        if (status >= 400)
          throw new Error((data as { error?: string }).error || 'Erro ao salvar');
        setModalOpen(null);
        loadPlans();
      })
      .catch((err) => setError(err.message || 'Erro ao salvar'))
      .finally(() => setSaving(false));
  };

  return (
    <>
      <PageHeader
        title="Planos"
        description="Crie e edite planos. Para mover uma empresa entre planos, use a tela Empresas."
        actions={
          <Button leftIcon={<Plus className="w-4 h-4" />} onClick={openCreate}>
            Criar plano
          </Button>
        }
      />

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} padding="md">
              <Skeleton height={20} width="60%" />
              <Skeleton className="mt-3" height={32} width="50%" />
              <Skeleton className="mt-6" height={14} width="100%" />
              <Skeleton className="mt-2" height={14} width="90%" />
              <Skeleton className="mt-2" height={14} width="80%" />
            </Card>
          ))}
        </div>
      ) : plans.length === 0 ? (
        <Card padding="lg">
          <EmptyState
            icon={<Sparkles className="w-5 h-5" />}
            title="Nenhum plano cadastrado"
            description="Comece criando o primeiro plano da plataforma."
            action={
              <Button leftIcon={<Plus className="w-4 h-4" />} onClick={openCreate}>
                Criar plano
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              tone={plan.popular ? 'elevated' : 'default'}
              className={`flex flex-col relative ${
                plan.popular ? 'ring-1 ring-inset ring-primary-200' : ''
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-2.5 left-4 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-primary-600 text-white shadow-xs">
                  <Sparkles className="w-3 h-3" /> Mais popular
                </span>
              )}
              <div className="flex justify-between items-start gap-3 mb-4">
                <div className="min-w-0">
                  <h3 className="text-lg font-semibold text-neutral-900">{plan.name}</h3>
                  <p className="text-xs text-neutral-500 font-mono">{plan.slug}</p>
                  <p className="mt-3 text-2xl font-semibold text-neutral-900 tabular-nums">
                    {formatCurrency(plan.price)}
                    <span className="text-sm text-neutral-500 font-normal">/mês</span>
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge tone={plan.active ? 'success' : 'neutral'} icon={<Check className="w-3 h-3" />}>
                    {plan.active ? 'Ativo' : 'Inativo'}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label="Editar plano"
                    onClick={() => openEdit(plan)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {plan.description && (
                <p className="text-sm text-neutral-600 mb-4 line-clamp-2">{plan.description}</p>
              )}

              <dl className="mt-auto grid grid-cols-3 gap-2 pt-4 border-t border-neutral-200">
                <div>
                  <dt className="text-[11px] font-medium uppercase tracking-wider text-neutral-500">
                    Usuários
                  </dt>
                  <dd className="mt-1 text-sm font-semibold text-neutral-800 tabular-nums">
                    {formatLimit(plan.usersLimit)}
                  </dd>
                </div>
                <div>
                  <dt className="text-[11px] font-medium uppercase tracking-wider text-neutral-500">
                    Req./mês
                  </dt>
                  <dd className="mt-1 text-sm font-semibold text-neutral-800 tabular-nums">
                    {formatLimit(plan.requestsPerMonthLimit)}
                  </dd>
                </div>
                <div>
                  <dt className="text-[11px] font-medium uppercase tracking-wider text-neutral-500">
                    Prop./mês
                  </dt>
                  <dd className="mt-1 text-sm font-semibold text-neutral-800 tabular-nums">
                    {formatLimit(plan.proposalsPerMonthLimit)}
                  </dd>
                </div>
              </dl>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={modalOpen !== null}
        onClose={() => setModalOpen(null)}
        title={modalOpen === 'create' ? 'Criar plano' : 'Editar plano'}
        description={
          modalOpen === 'create'
            ? 'Defina os limites, preços e conteúdo de um novo plano.'
            : 'Ajuste os detalhes deste plano.'
        }
        size="lg"
        footer={
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(null)}>
              Cancelar
            </Button>
            <Button
              type="submit"
              form="plan-form"
              isLoading={saving}
            >
              {modalOpen === 'create' ? 'Criar plano' : 'Salvar alterações'}
            </Button>
          </div>
        }
      >
        <form id="plan-form" onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="text-sm text-danger-700 bg-danger-50 ring-1 ring-inset ring-danger-200 rounded-md px-3 py-2">
              {error}
            </div>
          )}

          <Tabs<FormTab> items={tabItems} value={tab} onChange={setTab} />

          {tab === 'general' && (
            <div className="space-y-4">
              {modalOpen === 'create' && (
                <Input
                  label="Slug (único)"
                  helperText="Identificador interno em minúsculas, ex.: starter"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  placeholder="starter"
                  required
                />
              )}
              <Input
                label="Nome"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
              <Input
                label="Preço (R$/mês)"
                type="number"
                min={0}
                value={form.price || ''}
                onChange={(e) => setForm({ ...form, price: Number(e.target.value) || 0 })}
              />
              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center gap-2 text-sm text-neutral-700">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                    checked={form.popular}
                    onChange={(e) => setForm({ ...form, popular: e.target.checked })}
                  />
                  Marcar como mais popular
                </label>
                <label className="flex items-center gap-2 text-sm text-neutral-700">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                    checked={form.active}
                    onChange={(e) => setForm({ ...form, active: e.target.checked })}
                  />
                  Plano ativo
                </label>
              </div>
              <Input
                label="Ordem de exibição"
                type="number"
                min={0}
                value={form.sortOrder}
                onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) || 0 })}
                helperText="Quanto menor, mais à esquerda."
              />
            </div>
          )}

          {tab === 'limits' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                label="Usuários"
                type="number"
                min={0}
                value={form.usersLimit || ''}
                onChange={(e) => setForm({ ...form, usersLimit: Number(e.target.value) || 0 })}
                helperText=">= 99999 = ilimitado"
              />
              <Input
                label="Requisições/mês"
                type="number"
                min={0}
                value={form.requestsPerMonthLimit || ''}
                onChange={(e) =>
                  setForm({ ...form, requestsPerMonthLimit: Number(e.target.value) || 0 })
                }
              />
              <Input
                label="Propostas/mês"
                type="number"
                min={0}
                value={form.proposalsPerMonthLimit || ''}
                onChange={(e) =>
                  setForm({ ...form, proposalsPerMonthLimit: Number(e.target.value) || 0 })
                }
              />
            </div>
          )}

          {tab === 'content' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1.5">
                  Descrição
                </label>
                <textarea
                  className="input min-h-[80px] py-2"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1.5">
                  Features (uma por linha)
                </label>
                <textarea
                  className="input min-h-[140px] py-2 font-mono text-xs leading-5"
                  value={form.features}
                  onChange={(e) => setForm({ ...form, features: e.target.value })}
                  placeholder="3 usuários por empresa&#10;20 requisições/mês"
                  rows={6}
                />
              </div>
            </div>
          )}
        </form>

        <p className="mt-4 text-xs text-neutral-500">
          Para alterar o plano de uma empresa específica, vá em{' '}
          <Link href="/admin/companies" className="link">
            Empresas
          </Link>
          .
        </p>
      </Modal>
    </>
  );
}
