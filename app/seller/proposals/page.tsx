'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Input from '@/components/Input';
import { Search, Eye } from 'lucide-react';

type ProposalItem = {
  id: string;
  requestId: string;
  title: string;
  buyer: string;
  price: string;
  deliveryDays: string;
  status: string;
  createdAt: string;
};

export default function ProposalsPage() {
  const [proposals, setProposals] = useState<ProposalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetch('/api/proposals')
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('Erro ao carregar'))))
      .then(setProposals)
      .catch(() => setError('Não foi possível carregar as propostas.'))
      .finally(() => setLoading(false));
  }, []);

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; class: string }> = {
      sent: { label: 'Enviada', class: 'badge-info' },
      viewed: { label: 'Visualizada', class: 'badge-warning' },
      accepted: { label: 'Aceita', class: 'badge-success' },
      rejected: { label: 'Recusada', class: 'badge-danger' },
    };
    const badge = badges[status] || badges.sent;
    return <span className={`badge ${badge.class}`}>{badge.label}</span>;
  };

  const filteredProposals = proposals.filter((prop) => {
    const matchesSearch =
      !searchTerm ||
      prop.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prop.buyer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || prop.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header userType="seller" />

      <main className="flex-grow py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Minhas Propostas</h1>
            <p className="text-gray-600 mt-1">Acompanhe o status das suas propostas</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-danger-50 border border-danger-200 rounded-lg text-danger-800 text-sm">
              {error}
            </div>
          )}

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
            {loading ? (
              <Card className="text-center py-12">
                <p className="text-gray-600">Carregando propostas...</p>
              </Card>
            ) : filteredProposals.length === 0 ? (
              <Card className="text-center py-12">
                <p className="text-gray-600">Nenhuma proposta encontrada</p>
              </Card>
            ) : (
              filteredProposals.map((proposal) => (
                <Card key={proposal.id} hover>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{proposal.title}</h3>
                        {getStatusBadge(proposal.status)}
                      </div>
                      <div className="flex items-center space-x-6 text-sm text-gray-600">
                        <span>
                          <strong>Comprador:</strong> {proposal.buyer}
                        </span>
                        <span>
                          <strong>Preço:</strong> R$ {Number(proposal.price || 0).toFixed(2)}
                        </span>
                        <span>
                          <strong>Prazo:</strong> {proposal.deliveryDays} dias
                        </span>
                        <span>Enviada em {new Date(proposal.createdAt).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Link href={`/seller/opportunities/${proposal.requestId}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-1" />
                          Ver
                        </Button>
                      </Link>
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
