'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Modal from '@/components/Modal';
import { Check, Plus, Pencil } from 'lucide-react';

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

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState<'create' | Plan | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

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
      .then((res) => {
        const data = res.json().then((d) => ({ status: res.status, data: d }));
        return data;
      })
      .then(({ status, data }) => {
        if (status >= 400) throw new Error((data as { error?: string }).error || 'Erro ao salvar');
        setModalOpen(null);
        loadPlans();
      })
      .catch((err) => setError(err.message || 'Erro ao salvar'))
      .finally(() => setSaving(false));
  };

  const formatLimit = (n: number) => (n >= 99999 ? 'Ilimitado' : n.toLocaleString('pt-BR'));

  return (
    <div className="min-h-screen flex flex-col">
      <Header userType="admin" userName="Admin" />

      <main className="flex-grow py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Planos</h1>
              <p className="text-gray-600 mt-1">
                Crie e edite planos. Para alterar o plano de uma empresa, use a tela{' '}
                <Link href="/admin/companies" className="text-primary-600 hover:underline">
                  Empresas
                </Link>
                .
              </p>
            </div>
            <Button onClick={openCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Criar plano
            </Button>
          </div>

          {loading ? (
            <p className="text-gray-600">Carregando...</p>
          ) : plans.length === 0 ? (
            <p className="text-gray-500">Nenhum plano encontrado.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <Card key={plan.id} className="flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                      <p className="text-sm text-gray-500">{plan.slug}</p>
                      <p className="text-2xl font-bold text-primary-600 mt-2">
                        R$ {plan.price.toLocaleString('pt-BR')}
                        <span className="text-sm text-gray-600 font-normal">/mês</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`badge ${plan.active ? 'badge-success' : 'badge-secondary'}`}
                      >
                        <Check className="w-3 h-3 mr-1" />
                        {plan.active ? 'Ativo' : 'Inativo'}
                      </span>
                      <Button variant="outline" size="sm" onClick={() => openEdit(plan)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600 flex-grow">
                    <div className="flex justify-between">
                      <span>Usuários:</span>
                      <span className="font-semibold">{formatLimit(plan.usersLimit)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Requisições/mês:</span>
                      <span className="font-semibold">
                        {formatLimit(plan.requestsPerMonthLimit)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Propostas/mês:</span>
                      <span className="font-semibold">
                        {formatLimit(plan.proposalsPerMonthLimit)}
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <Modal
        isOpen={modalOpen !== null}
        onClose={() => setModalOpen(null)}
        title={modalOpen === 'create' ? 'Criar plano' : 'Editar plano'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>
          )}
          {modalOpen === 'create' && (
            <Input
              label="Slug (único, ex: starter)"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              placeholder="ex: starter"
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
          <div className="grid grid-cols-3 gap-2">
            <Input
              label="Usuários"
              type="number"
              min={0}
              value={form.usersLimit || ''}
              onChange={(e) =>
                setForm({ ...form, usersLimit: Number(e.target.value) || 0 })
              }
            />
            <Input
              label="Req./mês"
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
            <textarea
              className="input w-full min-h-[80px]"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Features (uma por linha)
            </label>
            <textarea
              className="input w-full min-h-[120px] font-mono text-sm"
              value={form.features}
              onChange={(e) => setForm({ ...form, features: e.target.value })}
              placeholder="3 usuários por empresa&#10;20 requisições/mês"
              rows={5}
            />
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.popular}
                onChange={(e) => setForm({ ...form, popular: e.target.checked })}
                className="rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">Mais popular</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
                className="rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">Ativo</span>
            </label>
            <label className="flex items-center gap-2">
              <span className="text-sm text-gray-700">Ordem:</span>
              <input
                type="number"
                min={0}
                className="input w-20"
                value={form.sortOrder}
                onChange={(e) =>
                  setForm({ ...form, sortOrder: Number(e.target.value) || 0 })
                }
              />
            </label>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setModalOpen(null)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Salvando...' : modalOpen === 'create' ? 'Criar' : 'Salvar'}
            </Button>
          </div>
        </form>
      </Modal>

      <Footer />
    </div>
  );
}
