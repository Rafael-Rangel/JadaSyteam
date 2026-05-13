'use client';

import { useState, useEffect, useMemo } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Modal from '@/components/Modal';
import DataTable, { DataTableColumn } from '@/components/ui/DataTable';
import Badge from '@/components/ui/Badge';
import { Plus } from 'lucide-react';
import { roleBadge } from '@/lib/dashboardUi';

type UserRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  createdAt: string;
};

type SubscriptionData = {
  limits: { users: number };
  usage: { users: number };
};

export default function SellerUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [limits, setLimits] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'employee',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([
      fetch('/api/company/users').then((r) => (r.ok ? r.json() : [])),
      fetch('/api/company/subscription').then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([userList, sub]) => {
        setUsers(userList);
        setLimits(sub);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const canAddUser = limits ? users.length < limits.limits.users : true;

  const columns: DataTableColumn<UserRow>[] = useMemo(
    () => [
      {
        key: 'name',
        header: 'Nome',
        render: (row) => (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-600 text-sm font-medium text-white">
              {row.name.charAt(0)}
            </div>
            <span className="font-medium text-neutral-900">{row.name}</span>
          </div>
        ),
      },
      { key: 'email', header: 'E-mail', render: (row) => <span className="text-neutral-600">{row.email}</span> },
      {
        key: 'phone',
        header: 'Telefone',
        render: (row) => <span className="text-neutral-600">{row.phone ?? '—'}</span>,
      },
      { key: 'role', header: 'Função', render: (row) => roleBadge(row.role) },
      {
        key: 'status',
        header: 'Status',
        render: () => <Badge tone="success">Ativo</Badge>,
      },
    ],
    []
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Nome é obrigatório';
    if (!formData.email.trim()) newErrors.email = 'E-mail é obrigatório';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'E-mail inválido';
    if (!formData.password) newErrors.password = 'Senha é obrigatória';
    else if (formData.password.length < 8) newErrors.password = 'Senha deve ter no mínimo 8 caracteres';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/company/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim() || undefined,
          password: formData.password,
          role: formData.role,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrors({ email: data.error || 'Erro ao adicionar usuário.' });
        setSubmitting(false);
        return;
      }
      setShowAddModal(false);
      setFormData({ name: '', email: '', phone: '', password: '', role: 'employee' });
      load();
    } catch {
      setErrors({ email: 'Erro ao adicionar. Tente novamente.' });
    }
    setSubmitting(false);
  };

  return (
    <div>
      <PageHeader
        title="Equipe"
        description="Gerencie os usuários da sua empresa."
        actions={
          <Button onClick={() => setShowAddModal(true)} disabled={!canAddUser}>
            <Plus className="mr-2 inline h-5 w-5" />
            Adicionar usuário
          </Button>
        }
      />

      {!canAddUser && (
        <div className="mb-6 rounded-lg border border-warning-200 bg-warning-50 p-4 text-sm text-warning-800">
          Você atingiu o limite de usuários do seu plano. Faça upgrade para adicionar mais.
        </div>
      )}

      {limits && (
        <p className="mb-4 text-sm text-neutral-600">
          Usuários: {users.length}/{limits.limits.users} (limite do plano)
        </p>
      )}

      <DataTable<UserRow>
        columns={columns}
        rows={users}
        rowKey={(row) => row.id}
        loading={loading}
        emptyTitle="Nenhum usuário"
        emptyDescription="Adicione colaboradores à sua empresa."
      />

      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setFormData({ name: '', email: '', phone: '', password: '', role: 'employee' });
          setErrors({});
        }}
        title="Adicionar usuário"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nome completo"
            placeholder="João Silva"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={errors.name}
            required
          />
          <Input
            label="E-mail"
            type="email"
            placeholder="joao@empresa.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            error={errors.email}
            required
          />
          <Input
            label="Telefone"
            placeholder="(11) 99999-9999"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
          <Input
            label="Senha"
            type="password"
            placeholder="Mínimo 8 caracteres"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            error={errors.password}
            required
          />
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">Função</label>
            <select
              className="input"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            >
              <option value="employee">Funcionário</option>
              <option value="manager">Gerente</option>
            </select>
          </div>
          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowAddModal(false);
                setFormData({ name: '', email: '', phone: '', password: '', role: 'employee' });
                setErrors({});
              }}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" isLoading={submitting}>
              Adicionar
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
