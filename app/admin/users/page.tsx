'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Plus,
  Save,
  Shield,
  Headphones,
  Pencil,
  UserX,
  UserCheck,
  Filter,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Modal from '@/components/Modal';
import Badge from '@/components/ui/Badge';
import DataTable, { DataTableColumn } from '@/components/ui/DataTable';
import ActionMenu from '@/components/ui/ActionMenu';
import Tabs from '@/components/ui/Tabs';

type PlatformRole = 'admin' | 'assistant';

type PlatformUser = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: PlatformRole;
  restrictToAssignedCompanies: boolean;
  active: boolean;
  createdAt: string;
  assignments: { companyId: string; companyName: string }[];
  permissions: {
    canAccessAdmin: boolean;
    canAccessAssistantHub: boolean;
    canManageClientOperations: boolean;
    restrictToAssignedCompanies: boolean;
  };
};

type CompanyOption = { id: string; name: string };

const emptyForm = {
  name: '',
  email: '',
  password: '',
  phone: '',
  role: 'assistant' as PlatformRole,
  restrictToAssignedCompanies: true,
  companyIds: [] as string[],
};

const roleLabel: Record<PlatformRole, string> = {
  admin: 'Administrador',
  assistant: 'Assistente',
};

const roleTone: Record<PlatformRole, 'accent' | 'info'> = {
  admin: 'accent',
  assistant: 'info',
};

export default function AdminUsersPage() {
  const { data: session } = useSession();
  const currentUserId = (session?.user as { id?: string })?.id;

  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [companies, setCompanies] = useState<CompanyOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<'all' | 'admin' | 'assistant'>('all');
  const [showInactive, setShowInactive] = useState(false);
  const [search, setSearch] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<PlatformUser | null>(null);
  const [form, setForm] = useState(emptyForm);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (showInactive) params.set('includeInactive', 'true');
      const [uRes, cRes] = await Promise.all([
        fetch(`/api/admin/users?${params}`),
        fetch('/api/admin/companies'),
      ]);
      const uData = await uRes.json();
      const cList = await cRes.json();
      if (!uRes.ok) {
        setError(uData.error ?? 'Falha ao carregar usuários.');
        return;
      }
      const companiesRaw = Array.isArray(cList) ? cList : [];
      setUsers(uData.users ?? []);
      setCompanies(
        companiesRaw
          .filter((c: { approvalStatus?: string }) => c.approvalStatus === 'approved')
          .map((c: { id: string; name: string }) => ({ id: c.id, name: c.name }))
      );
    } catch {
      setError('Erro de rede ao carregar dados.');
    } finally {
      setLoading(false);
    }
  }, [showInactive]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      if (tab === 'admin' && u.role !== 'admin') return false;
      if (tab === 'assistant' && u.role !== 'assistant') return false;
      if (!q) return true;
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.phone ?? '').includes(q)
      );
    });
  }, [users, tab, search]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(user: PlatformUser) {
    setEditing(user);
    setForm({
      name: user.name,
      email: user.email,
      password: '',
      phone: user.phone ?? '',
      role: user.role,
      restrictToAssignedCompanies: user.restrictToAssignedCompanies,
      companyIds: user.assignments.map((a) => a.companyId),
    });
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditing(null);
    setForm(emptyForm);
  }

  function toggleCompany(id: string) {
    setForm((f) => ({
      ...f,
      companyIds: f.companyIds.includes(id)
        ? f.companyIds.filter((x) => x !== id)
        : [...f.companyIds, id],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        name: form.name,
        email: form.email,
        phone: form.phone || null,
        role: form.role,
        restrictToAssignedCompanies: form.restrictToAssignedCompanies,
        companyIds: form.role === 'assistant' ? form.companyIds : [],
        ...(form.password ? { password: form.password } : {}),
      };

      const url = editing ? `/api/admin/users/${editing.id}` : '/api/admin/users';
      const method = editing ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Erro ao salvar usuário.');
        return;
      }
      closeModal();
      await load();
    } catch {
      setError('Erro de rede.');
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(user: PlatformUser) {
    if (!user.active) {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: true }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? 'Erro ao reativar.');
        return;
      }
      await load();
      return;
    }
    if (!confirm(`Desativar ${user.name}? O usuário não poderá mais entrar.`)) return;
    const res = await fetch(`/api/admin/users/${user.id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? 'Erro ao desativar.');
      return;
    }
    await load();
  }

  const columns: DataTableColumn<PlatformUser>[] = [
    {
      key: 'name',
      header: 'Nome',
      render: (u) => (
        <div>
          <p className="font-medium text-neutral-900">{u.name}</p>
          <p className="text-xs text-neutral-500">{u.email}</p>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Papel',
      render: (u) => (
        <Badge tone={roleTone[u.role]}>
          {u.role === 'admin' ? (
            <span className="inline-flex items-center gap-1">
              <Shield className="w-3 h-3" /> {roleLabel[u.role]}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1">
              <Headphones className="w-3 h-3" /> {roleLabel[u.role]}
            </span>
          )}
        </Badge>
      ),
    },
    {
      key: 'permissions',
      header: 'Permissões',
      render: (u) => (
        <div className="text-xs text-neutral-600 max-w-xs">
          {u.role === 'admin' ? (
            <span>Painel admin, empresas, planos, financeiro e esta equipe</span>
          ) : (
            <span>
              Operação em clientes
              {u.restrictToAssignedCompanies
                ? ' (só empresas atribuídas)'
                : ' (todas as empresas cliente)'}
              · sem admin
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'assignments',
      header: 'Clientes',
      render: (u) =>
        u.role === 'assistant' ? (
          <span className="text-sm text-neutral-600">{u.assignments.length} atribuída(s)</span>
        ) : (
          <span className="text-sm text-neutral-400">—</span>
        ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (u) => (
        <Badge tone={u.active ? 'success' : 'neutral'}>{u.active ? 'Ativo' : 'Inativo'}</Badge>
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (u) => (
        <ActionMenu
          items={[
            {
              id: 'edit',
              label: 'Editar',
              icon: <Pencil className="w-4 h-4" />,
              onClick: () => openEdit(u),
            },
            {
              id: 'toggle',
              label: u.active ? 'Desativar' : 'Reativar',
              icon: u.active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />,
              danger: u.active,
              disabled: u.id === currentUserId && u.active,
              onClick: () => toggleActive(u),
            },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Equipe JADA"
        description="Administradores e assistentes da plataforma. Gerencie papéis, permissões e empresas atribuídas."
        actions={
          <Button onClick={openCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Novo usuário
          </Button>
        }
      />

      {error && (
        <p className="text-sm text-danger-700 bg-danger-50 border border-danger-100 rounded-md px-3 py-2">
          {error}
        </p>
      )}

      <Card className="p-4 space-y-4">
        <div className="flex flex-wrap items-center gap-3 justify-between">
          <Tabs
            value={tab}
            onChange={(v) => setTab(v as typeof tab)}
            items={[
              { id: 'all', label: 'Todos' },
              { id: 'admin', label: 'Administradores' },
              { id: 'assistant', label: 'Assistentes' },
            ]}
          />
          <label className="flex items-center gap-2 text-sm text-neutral-600 cursor-pointer">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
            />
            Mostrar inativos
          </label>
        </div>
        <div className="relative max-w-md">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <Input
            placeholder="Buscar por nome ou e-mail..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      <DataTable
        columns={columns}
        rows={filtered}
        rowKey={(u) => u.id}
        loading={loading}
        emptyTitle="Nenhum usuário encontrado"
        emptyDescription="Cadastre administradores ou assistentes da JADA."
        emptyAction={
          <Button size="sm" onClick={openCreate}>
            Novo usuário
          </Button>
        }
      />

      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editing ? 'Editar usuário' : 'Novo usuário'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Nome"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
            />
            <Input
              label="E-mail"
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              required
              disabled={!!editing}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label={editing ? 'Nova senha (opcional)' : 'Senha inicial'}
              type="password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              required={!editing}
            />
            <Input
              label="Telefone"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            />
          </div>

          <div>
            <p className="text-sm font-medium text-neutral-800 mb-2">Papel na JADA</p>
            <div className="flex flex-wrap gap-3">
              {(['admin', 'assistant'] as PlatformRole[]).map((r) => (
                <label
                  key={r}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md border cursor-pointer text-sm ${
                    form.role === r
                      ? 'border-primary-500 bg-primary-50 text-primary-900'
                      : 'border-neutral-200 text-neutral-700'
                  } ${editing?.id === currentUserId && r === 'assistant' ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={r}
                    checked={form.role === r}
                    disabled={editing?.id === currentUserId && r === 'assistant'}
                    onChange={() => setForm((f) => ({ ...f, role: r }))}
                  />
                  {roleLabel[r]}
                </label>
              ))}
            </div>
            {form.role === 'admin' && (
              <p className="mt-2 text-xs text-neutral-500">
                Acesso completo ao painel administrativo. Não atua como assistente de clientes.
              </p>
            )}
            {form.role === 'assistant' && (
              <p className="mt-2 text-xs text-neutral-500">
                Acesso operacional às empresas cliente (requisições, propostas, equipe, assinatura).
                Sem painel admin, due diligence ou financeiro da plataforma.
              </p>
            )}
          </div>

          {form.role === 'assistant' && (
            <>
              <label className="flex items-start gap-2 text-sm text-neutral-700 cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={form.restrictToAssignedCompanies}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, restrictToAssignedCompanies: e.target.checked }))
                  }
                />
                <span>Limitar a ver apenas empresas atribuídas a este usuário</span>
              </label>
              <div>
                <p className="text-sm font-medium text-neutral-800 mb-2">Empresas atribuídas</p>
                <div className="max-h-52 overflow-y-auto border border-neutral-200 rounded-md p-2 space-y-1">
                  {companies.length === 0 ? (
                    <p className="text-xs text-neutral-500">Nenhuma empresa aprovada.</p>
                  ) : (
                    companies.map((c) => (
                      <label key={c.id} className="flex items-center gap-2 text-sm cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.companyIds.includes(c.id)}
                          onChange={() => toggleCompany(c.id)}
                        />
                        {c.name}
                      </label>
                    ))
                  )}
                </div>
              </div>
            </>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100">
            <Button type="button" variant="secondary" onClick={closeModal}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Salvando...' : editing ? 'Salvar alterações' : 'Criar usuário'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
