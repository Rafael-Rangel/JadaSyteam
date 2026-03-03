'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Input from '@/components/Input';
import { Search, Plus, Eye, Edit, X } from 'lucide-react';

type RequestItem = {
  id: string;
  title: string;
  status: string;
  proposals: number;
  created: string;
  expires: string | null;
};

export default function RequestsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/requests?buyerOnly=true')
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('Erro ao carregar'))))
      .then(setRequests)
      .catch(() => setError('Não foi possível carregar as requisições.'))
      .finally(() => setLoading(false));
  }, []);

  const getStatusBadge = (status: string) => {
    const badges = {
      open: { label: 'Aberto', class: 'badge-info' },
      receiving: { label: 'Recebendo Propostas', class: 'badge-warning' },
      selected: { label: 'Proposta Aceita', class: 'badge-success' },
      closed: { label: 'Finalizado', class: 'badge' },
    };
    const badge = badges[status as keyof typeof badges] || badges.open;
    return <span className={`badge ${badge.class}`}>{badge.label}</span>;
  };

  const filteredRequests = requests.filter((req) => {
    const matchesSearch = req.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header userType="buyer" />
      
      <main className="flex-grow py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Minhas Requisições</h1>
              <p className="text-gray-600 mt-1">Gerencie todas as suas requisições</p>
            </div>
            <Link href="/buyer/create-request">
              <Button>
                <Plus className="w-5 h-5 mr-2 inline" />
                Nova Requisição
              </Button>
            </Link>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Buscar requisições..."
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
                  <option value="open">Aberto</option>
                  <option value="receiving">Recebendo Propostas</option>
                  <option value="selected">Proposta Aceita</option>
                  <option value="closed">Finalizado</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Requests List */}
          <div className="space-y-4">
            {filteredRequests.length === 0 ? (
              <Card className="text-center py-12">
                <p className="text-gray-600 mb-4">Nenhuma requisição encontrada</p>
                <Link href="/buyer/create-request">
                  <Button>Criar Primeira Requisição</Button>
                </Link>
              </Card>
            ) : (
              filteredRequests.map((request) => (
                <Card key={request.id} hover>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{request.title}</h3>
                        {getStatusBadge(request.status)}
                      </div>
                      <div className="flex items-center space-x-6 text-sm text-gray-600">
                        <span>{request.proposals} propostas recebidas</span>
                        <span>Criada em {new Date(request.created).toLocaleDateString('pt-BR')}</span>
                        {request.expires && <span>Expira em {new Date(request.expires).toLocaleDateString('pt-BR')}</span>}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Link href={`/buyer/requests/${request.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-1" />
                          Ver
                        </Button>
                      </Link>
                      {request.status === 'open' && (
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4 mr-1" />
                          Editar
                        </Button>
                      )}
                      {request.status === 'open' && (
                        <Button variant="danger" size="sm">
                          <X className="w-4 h-4 mr-1" />
                          Cancelar
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



