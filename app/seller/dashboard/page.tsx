'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Button from '@/components/Button';
import PageHeader from '@/components/ui/PageHeader';
import KPIStat from '@/components/ui/KPIStat';
import DataTable, { DataTableColumn } from '@/components/ui/DataTable';
import { Package, TrendingUp, CheckCircle, Clock, Eye, Sparkles } from 'lucide-react';

type OpportunityItem = {
  id: string;
  title: string;
  description?: string;
  buyer: string;
  category: string;
  city: string;
  state: string;
  deliveryDate: string;
  created: string;
  hasProposal: boolean;
};

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

type CompanyData = { verificationStatus?: string };

export default function SellerDashboard() {
  const { data: session } = useSession();
  const [opportunities, setOpportunities] = useState<OpportunityItem[]>([]);
  const [proposals, setProposals] = useState<ProposalItem[]>([]);
  const [company, setCompany] = useState<CompanyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/requests').then((r) => (r.ok ? r.json() : [])),
      fetch('/api/proposals').then((r) => (r.ok ? r.json() : [])),
      fetch('/api/company').then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([opps, props, comp]) => {
        setOpportunities(opps);
        setProposals(props);
        setCompany(comp ?? null);
      })
      .catch(() => setError('Não foi possível carregar os dados.'))
      .finally(() => setLoading(false));
  }, []);

  const newOpps = useMemo(() => opportunities.filter((o) => !o.hasProposal), [opportunities]);
  const accepted = useMemo(() => proposals.filter((p) => p.status === 'accepted'), [proposals]);
  const pending = useMemo(
    () => proposals.filter((p) => p.status === 'sent' || p.status === 'viewed'),
    [proposals]
  );
  const recentOpportunities = useMemo(() => opportunities.slice(0, 8), [opportunities]);
  const userName = session?.user?.name ?? null;

  const columns: DataTableColumn<OpportunityItem>[] = useMemo(
    () => [
      {
        key: 'title',
        header: 'Oportunidade',
        render: (row) => <span className="font-medium text-neutral-900">{row.title}</span>,
      },
      {
        key: 'buyer',
        header: 'Comprador',
        render: (row) => <span className="text-neutral-600">{row.buyer}</span>,
      },
      {
        key: 'loc',
        header: 'Local',
        render: (row) => (
          <span className="text-neutral-600">
            {row.city} - {row.state}
          </span>
        ),
      },
      {
        key: 'created',
        header: 'Criada em',
        render: (row) => (
          <span className="text-neutral-600">{new Date(row.created).toLocaleDateString('pt-BR')}</span>
        ),
      },
      {
        key: 'actions',
        header: '',
        align: 'right',
        render: (row) => (
          <Link href={`/seller/opportunities/${row.id}`}>
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
      {error && (
        <div className="mb-6 rounded-lg border border-danger-200 bg-danger-50 p-4 text-sm text-danger-800">
          {error}
        </div>
      )}

      {company?.verificationStatus && company.verificationStatus !== 'approved' && (
        <div className="mb-6 rounded-lg border border-warning-200 bg-warning-50 p-4 text-sm text-warning-800">
          Sua empresa está em análise de CNPJ. Você não pode enviar propostas até a aprovação.
        </div>
      )}

      <PageHeader
        title="Dashboard"
        description={userName ? `Bem-vindo de volta, ${userName}.` : 'Acompanhe oportunidades e propostas.'}
        actions={
          <Link href="/seller/opportunities">
            <Button variant="outline">
              <Sparkles className="mr-2 inline h-4 w-4" />
              Ver oportunidades
            </Button>
          </Link>
        }
      />

      <div className="mb-6 hidden justify-end sm:flex">
        <div className="relative h-14 w-14 shrink-0 opacity-90">
          <Image src="/mascote.png" alt="" role="presentation" fill className="object-contain" />
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-neutral-600">Carregando…</p>
      ) : (
        <>
          <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <KPIStat label="Oportunidades novas" value={newOpps.length} icon={<Package className="h-5 w-5" />} />
            <KPIStat label="Propostas enviadas" value={proposals.length} icon={<TrendingUp className="h-5 w-5" />} />
            <KPIStat label="Propostas aceitas" value={accepted.length} icon={<CheckCircle className="h-5 w-5" />} />
            <KPIStat label="Aguardando resposta" value={pending.length} icon={<Clock className="h-5 w-5" />} />
          </div>

          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-base font-semibold text-neutral-900">Oportunidades recentes</h2>
            <Link href="/seller/opportunities" className="text-sm font-medium text-primary-600 hover:text-primary-700">
              Ver todas
            </Link>
          </div>
          <DataTable<OpportunityItem>
            columns={columns}
            rows={recentOpportunities}
            rowKey={(row) => row.id}
            emptyTitle="Nenhuma oportunidade"
            emptyDescription="Quando houver requisições públicas, elas aparecerão aqui."
            emptyAction={
              <Link href="/seller/opportunities">
                <Button variant="outline">Explorar oportunidades</Button>
              </Link>
            }
          />
        </>
      )}
    </div>
  );
}
