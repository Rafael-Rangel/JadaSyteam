'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Input from '@/components/Input';
import { Search, Eye, Shield, X, Check } from 'lucide-react';

export default function CompaniesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const companies = [
    {
      id: 1,
      name: 'Empresa ABC',
      cnpj: '12.345.678/0001-90',
      type: 'buyer',
      plan: 'Growth',
      status: 'active',
      users: 8,
      created: '2024-01-15',
    },
    {
      id: 2,
      name: 'Fornecedor XYZ',
      cnpj: '98.765.432/0001-10',
      type: 'seller',
      plan: 'Starter',
      status: 'active',
      users: 3,
      created: '2024-01-14',
    },
    {
      id: 3,
      name: 'Construção Total',
      cnpj: '11.222.333/0001-44',
      type: 'both',
      plan: 'Enterprise',
      status: 'suspended',
      users: 15,
      created: '2024-01-10',
    },
  ];

  const getStatusBadge = (status: string) => {
    const badges = {
      active: { label: 'Ativa', class: 'badge-success' },
      suspended: { label: 'Suspensa', class: 'badge-danger' },
      pending: { label: 'Pendente', class: 'badge-warning' },
    };
    const badge = badges[status as keyof typeof badges] || badges.active;
    return <span className={`badge ${badge.class}`}>{badge.label}</span>;
  };

  const getTypeBadge = (type: string) => {
    const types = {
      buyer: { label: 'Comprador', class: 'badge-info' },
      seller: { label: 'Vendedor', class: 'badge-secondary' },
      both: { label: 'Ambos', class: 'badge-warning' },
    };
    const typeInfo = types[type as keyof typeof types] || types.buyer;
    return <span className={`badge ${typeInfo.class}`}>{typeInfo.label}</span>;
  };

  const filteredCompanies = companies.filter((company) => {
    const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.cnpj.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || company.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header userType="admin" userName="Admin" />
      
      <main className="flex-grow py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Empresas</h1>
            <p className="text-gray-600 mt-1">Gerencie todas as empresas cadastradas</p>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Buscar empresas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div>
                <select
                  className="input"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">Todos os status</option>
                  <option value="active">Ativa</option>
                  <option value="suspended">Suspensa</option>
                  <option value="pending">Pendente</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Companies Table */}
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Empresa</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">CNPJ</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Tipo</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Plano</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Usuários</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCompanies.map((company) => (
                    <tr key={company.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-900">{company.name}</div>
                        <div className="text-sm text-gray-500">
                          Criada em {new Date(company.created).toLocaleDateString('pt-BR')}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{company.cnpj}</td>
                      <td className="py-3 px-4">{getTypeBadge(company.type)}</td>
                      <td className="py-3 px-4">
                        <span className="text-gray-700">{company.plan}</span>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{company.users}</td>
                      <td className="py-3 px-4">{getStatusBadge(company.status)}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-1" />
                            Ver
                          </Button>
                          {company.status === 'active' ? (
                            <Button variant="danger" size="sm">
                              <X className="w-4 h-4" />
                            </Button>
                          ) : (
                            <Button variant="success" size="sm">
                              <Check className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}

