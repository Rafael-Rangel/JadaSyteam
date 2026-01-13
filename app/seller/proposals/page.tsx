'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Input from '@/components/Input';
import { Search, Edit, Eye, Check, X } from 'lucide-react';

export default function ProposalsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const proposals = [
    {
      id: 1,
      requestTitle: '600 parafusos M6',
      buyer: 'Empresa ABC',
      price: 450.00,
      deliveryTime: 5,
      status: 'sent',
      created: '2024-01-15',
    },
    {
      id: 2,
      requestTitle: '100 metros de cabo elétrico',
      buyer: 'Empresa XYZ',
      price: 320.00,
      deliveryTime: 7,
      status: 'viewed',
      created: '2024-01-14',
    },
    {
      id: 3,
      requestTitle: '50 placas de madeira',
      buyer: 'Construção Total',
      price: 1200.00,
      deliveryTime: 10,
      status: 'accepted',
      created: '2024-01-10',
    },
  ];

  const getStatusBadge = (status: string) => {
    const badges = {
      sent: { label: 'Enviada', class: 'badge-info' },
      viewed: { label: 'Visualizada', class: 'badge-warning' },
      accepted: { label: 'Aceita', class: 'badge-success' },
      rejected: { label: 'Recusada', class: 'badge-danger' },
    };
    const badge = badges[status as keyof typeof badges] || badges.sent;
    return <span className={`badge ${badge.class}`}>{badge.label}</span>;
  };

  const filteredProposals = proposals.filter((prop) => {
    const matchesSearch = prop.requestTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prop.buyer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || prop.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header userType="seller" userName="Maria Santos" />
      
      <main className="flex-grow py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Minhas Propostas</h1>
            <p className="text-gray-600 mt-1">Acompanhe o status das suas propostas</p>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Buscar propostas..."
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
                  <option value="sent">Enviada</option>
                  <option value="viewed">Visualizada</option>
                  <option value="accepted">Aceita</option>
                  <option value="rejected">Recusada</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Proposals List */}
          <div className="space-y-4">
            {filteredProposals.length === 0 ? (
              <Card className="text-center py-12">
                <p className="text-gray-600">Nenhuma proposta encontrada</p>
              </Card>
            ) : (
              filteredProposals.map((proposal) => (
                <Card key={proposal.id} hover>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{proposal.requestTitle}</h3>
                        {getStatusBadge(proposal.status)}
                      </div>
                      <div className="flex items-center space-x-6 text-sm text-gray-600">
                        <span><strong>Comprador:</strong> {proposal.buyer}</span>
                        <span><strong>Preço:</strong> R$ {proposal.price.toFixed(2)}</span>
                        <span><strong>Prazo:</strong> {proposal.deliveryTime} dias</span>
                        <span>Enviada em {new Date(proposal.created).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-1" />
                        Ver
                      </Button>
                      {(proposal.status === 'sent' || proposal.status === 'viewed') && (
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

