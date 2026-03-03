'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Modal from '@/components/Modal';
import { Plus, Shield, UserCheck, UserX } from 'lucide-react';

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

export default function UsersPage() {
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

  const getRoleBadge = (role: string) => {
    const roles: Record<string, { label: string; icon: typeof Shield; class: string }> = {
      owner: { label: 'Dono', icon: Shield, class: 'bg-primary-100 text-primary-800' },
      manager: { label: 'Gerente', icon: UserCheck, class: 'bg-success-100 text-success-800' },
      employee: { label: 'Funcionário', icon: UserX, class: 'bg-gray-100 text-gray-800' },
    };
    const roleInfo = roles[role] || roles.employee;
    const Icon = roleInfo.icon;
    return (
      <span className={`badge ${roleInfo.class} flex items-center space-x-1 w-fit`}>
        <Icon className="w-3 h-3" />
        <span>{roleInfo.label}</span>
      </span>
    );
  };

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

  const canAddUser = limits ? users.length < limits.limits.users : true;

  return (
    <div className="min-h-screen flex flex-col">
      <Header userType="buyer" />

      <main className="flex-grow py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestão de Usuários</h1>
              <p className="text-gray-600 mt-1">Gerencie os usuários da sua empresa</p>
            </div>
            <Button onClick={() => setShowAddModal(true)} disabled={!canAddUser}>
              <Plus className="w-5 h-5 mr-2 inline" />
              Adicionar Usuário
            </Button>
          </div>

          {!canAddUser && (
            <div className="mb-6 p-4 bg-warning-50 border border-warning-200 rounded-lg text-warning-800 text-sm">
              Você atingiu o limite de usuários do seu plano. Faça upgrade para adicionar mais.
            </div>
          )}

          <Card>
            {loading ? (
              <p className="py-8 text-center text-gray-600">Carregando...</p>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Nome</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">E-mail</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Telefone</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Função</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-medium">{user.name.charAt(0)}</span>
                              </div>
                              <span className="font-medium text-gray-900">{user.name}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-gray-600">{user.email}</td>
                          <td className="py-3 px-4 text-gray-600">{user.phone ?? '—'}</td>
                          <td className="py-3 px-4">{getRoleBadge(user.role)}</td>
                          <td className="py-3 px-4">
                            <span className="badge badge-success">Ativo</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {limits && (
                  <div className="mt-4 text-sm text-gray-600">
                    Usuários: {users.length}/{limits.limits.users} (limite do plano)
                  </div>
                )}
              </>
            )}
          </Card>
        </div>
      </main>

      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setFormData({ name: '', email: '', phone: '', password: '', role: 'employee' });
          setErrors({});
        }}
        title="Adicionar Novo Usuário"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nome Completo"
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Função</label>
            <select
              className="input"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            >
              <option value="employee">Funcionário</option>
              <option value="manager">Gerente</option>
            </select>
          </div>
          <div className="flex space-x-4 pt-4">
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
              Adicionar Usuário
            </Button>
          </div>
        </form>
      </Modal>

      <Footer />
    </div>
  );
}
