'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Modal from '@/components/Modal';
import { Plus, User, Edit, Trash2, Shield, UserCheck, UserX } from 'lucide-react';

export default function UsersPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'user',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const users = [
    {
      id: 1,
      name: 'João Silva',
      email: 'joao@empresa.com',
      phone: '(11) 99999-9999',
      role: 'owner',
      status: 'active',
    },
    {
      id: 2,
      name: 'Maria Santos',
      email: 'maria@empresa.com',
      phone: '(11) 88888-8888',
      role: 'manager',
      status: 'active',
    },
    {
      id: 3,
      name: 'Pedro Costa',
      email: 'pedro@empresa.com',
      phone: '(11) 77777-7777',
      role: 'user',
      status: 'active',
    },
  ];

  const getRoleBadge = (role: string) => {
    const roles = {
      owner: { label: 'Dono', icon: Shield, class: 'bg-primary-100 text-primary-800' },
      manager: { label: 'Gerente', icon: UserCheck, class: 'bg-success-100 text-success-800' },
      user: { label: 'Funcionário', icon: UserX, class: 'bg-gray-100 text-gray-800' },
    };
    const roleInfo = roles[role as keyof typeof roles] || roles.user;
    const Icon = roleInfo.icon;
    return (
      <span className={`badge ${roleInfo.class} flex items-center space-x-1`}>
        <Icon className="w-3 h-3" />
        <span>{roleInfo.label}</span>
      </span>
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Nome é obrigatório';
    if (!formData.email) {
      newErrors.email = 'E-mail é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'E-mail inválido';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Simular criação (sem backend)
    setShowAddModal(false);
    setFormData({ name: '', email: '', phone: '', role: 'user' });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header userType="buyer" userName="João Silva" />
      
      <main className="flex-grow py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestão de Usuários</h1>
              <p className="text-gray-600 mt-1">Gerencie os usuários da sua empresa</p>
            </div>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="w-5 h-5 mr-2 inline" />
              Adicionar Usuário
            </Button>
          </div>

          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Nome</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">E-mail</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Telefone</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Função</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-medium">
                              {user.name.charAt(0)}
                            </span>
                          </div>
                          <span className="font-medium text-gray-900">{user.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{user.email}</td>
                      <td className="py-3 px-4 text-gray-600">{user.phone}</td>
                      <td className="py-3 px-4">{getRoleBadge(user.role)}</td>
                      <td className="py-3 px-4">
                        <span className="badge badge-success">Ativo</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end space-x-2">
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="danger" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 text-sm text-gray-600">
              <p>Usuários: {users.length}/10 (limite do plano Growth)</p>
            </div>
          </Card>
        </div>
      </main>

      {/* Add User Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setFormData({ name: '', email: '', phone: '', role: 'user' });
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Função <span className="text-danger-500">*</span>
            </label>
            <select
              className="input"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              required
            >
              <option value="user">Funcionário</option>
              <option value="manager">Gerente</option>
              <option value="owner">Dono/Administrador</option>
            </select>
          </div>

          <div className="flex space-x-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowAddModal(false);
                setFormData({ name: '', email: '', phone: '', role: 'user' });
                setErrors({});
              }}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button type="submit" className="flex-1">
              Adicionar Usuário
            </Button>
          </div>
        </form>
      </Modal>

      <Footer />
    </div>
  );
}



