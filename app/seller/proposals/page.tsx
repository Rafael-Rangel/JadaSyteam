'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Input from '@/components/Input';
import DataTable, { DataTableColumn } from '@/components/ui/DataTable';
import { Search, Eye } from 'lucide-react';
import { proposalStatusBadge } from '@/lib/dashboardUi';

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

  const filteredProposals = useMemo(
    () =>
      proposals.filter((prop) => {
        const matchesSearch =
          !searchTerm ||
          prop.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          prop.buyer.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || prop.status === statusFilter;
        return matchesSearch && matchesStatus;
      }),
    [proposals, searchTerm, statusFilter]
  );

  const columns: DataTableColumn<ProposalItem>[] = useMemo(
    () => [
      {
        key: 'title',
        header: 'Requisição',
        render: (row) => <span className="font-medium text-neutral-900">{row.title}</span>,
      },
      { key: 'buyer', header: 'Comprador', render: (row) => <span className="text-neutral-600">{row.buyer}</span> },
      {
        key: 'price',
        header: 'Preço',
        align: 'right',
        render: (row) => (
          <span className="tabular-nums text-neutral-800">R$ {Number(row.price || 0).toFixed(2)}</span>
        ),
      },
      {
        key: 'delivery',
        header: 'Prazo',
        align: 'right',
        render: (row) => <span className="text-neutral-600">{row.deliveryDays} dias</span>,
      },
      {
        key: 'status',
        header: 'Status',
        render: (row) => proposalStatusBadge(row.status),
      },
      {
        key: 'created',
        header: 'Enviada em',
        render: (row) => (
          <span className="text-neutral-600">{new Date(row.createdAt).toLocaleDateString('pt-BR')}</span>
        ),
      },
      {
        key: 'actions',
        header: '',
        align: 'right',
        render: (row) => (
          <Link href={`/seller/opportunities/${row.requestId}`}>
            <Button variant="outline" size="sm">
              <Eye className="mr-1 h-4 w-4" />
              Ver
            </Button>
          </Link>
        ),
      },
    ],
    []
  );

  return (
    <div>
      <PageHeader title="Minhas propostas" description="Acompanhe o status das suas propostas." />

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
              placeholder="Buscar propostas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-neutral-500">
              Status
            </label>
            <select className="input" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">Todos os status</option>
              <option value="sent">Enviada</option>
              <option value="viewed">Visualizada</option>
              <option value="accepted">Aceita</option>
              <option value="rejected">Recusada</option>
            </select>
          </div>
        </div>
      </Card>

      <DataTable<ProposalItem>
        columns={columns}
        rows={filteredProposals}
        rowKey={(row) => row.id}
        loading={loading}
        emptyTitle="Nenhuma proposta"
        emptyDescription="Envie propostas a partir das oportunidades disponíveis."
      />
    </div>
  );
}
