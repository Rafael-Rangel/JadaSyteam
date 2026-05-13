'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Input from '@/components/Input';
import DataTable, { DataTableColumn } from '@/components/ui/DataTable';
import { Search, Plus, Eye, Edit, X } from 'lucide-react';
import { requestStatusBadge } from '@/lib/dashboardUi';

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

  const filteredRequests = useMemo(
    () =>
      requests.filter((req) => {
        const matchesSearch = req.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
        return matchesSearch && matchesStatus;
      }),
    [requests, searchTerm, statusFilter]
  );

  const columns: DataTableColumn<RequestItem>[] = useMemo(
    () => [
      {
        key: 'title',
        header: 'Título',
        render: (row) => <span className="font-medium text-neutral-900">{row.title}</span>,
      },
      {
        key: 'status',
        header: 'Status',
        render: (row) => requestStatusBadge(row.status),
      },
      {
        key: 'proposals',
        header: 'Propostas',
        align: 'right',
        render: (row) => <span className="tabular-nums text-neutral-700">{row.proposals}</span>,
      },
      {
        key: 'created',
        header: 'Criada em',
        render: (row) => (
          <span className="text-neutral-600">{new Date(row.created).toLocaleDateString('pt-BR')}</span>
        ),
      },
      {
        key: 'expires',
        header: 'Expira',
        render: (row) => (
          <span className="text-neutral-600">
            {row.expires ? new Date(row.expires).toLocaleDateString('pt-BR') : '—'}
          </span>
        ),
      },
      {
        key: 'actions',
        header: '',
        align: 'right',
        render: (row) => (
          <div className="flex flex-wrap justify-end gap-2">
            <Link href={`/buyer/requests/${row.id}`}>
              <Button variant="outline" size="sm">
                <Eye className="mr-1 h-4 w-4" />
                Ver
              </Button>
            </Link>
            {row.status === 'open' && (
              <Button variant="outline" size="sm" type="button">
                <Edit className="mr-1 h-4 w-4" />
                Editar
              </Button>
            )}
            {row.status === 'open' && (
              <Button variant="danger" size="sm" type="button">
                <X className="mr-1 h-4 w-4" />
                Cancelar
              </Button>
            )}
          </div>
        ),
      },
    ],
    []
  );

  return (
    <div>
      <PageHeader
        title="Minhas requisições"
        description="Gerencie todas as suas requisições de compra."
        actions={
          <Link href="/buyer/create-request">
            <Button>
              <Plus className="mr-2 inline h-5 w-5" />
              Nova requisição
            </Button>
          </Link>
        }
      />

      {error && (
        <div className="mb-6 rounded-lg border border-danger-200 bg-danger-50 p-4 text-sm text-danger-800">
          {error}
        </div>
      )}

      <Card className="mb-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-neutral-400" />
            <Input
              placeholder="Buscar requisições..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-neutral-500">
              Status
            </label>
            <select
              className="input w-full"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Todos os status</option>
              <option value="open">Aberto</option>
              <option value="receiving">Recebendo propostas</option>
              <option value="selected">Proposta aceita</option>
              <option value="closed">Finalizado</option>
            </select>
          </div>
        </div>
      </Card>

      <DataTable<RequestItem>
        columns={columns}
        rows={filteredRequests}
        rowKey={(row) => row.id}
        loading={loading}
        emptyTitle="Nenhuma requisição encontrada"
        emptyDescription="Ajuste os filtros ou crie uma nova requisição."
        emptyAction={
          <Link href="/buyer/create-request">
            <Button>Criar primeira requisição</Button>
          </Link>
        }
      />
    </div>
  );
}
