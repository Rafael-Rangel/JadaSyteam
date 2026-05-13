'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/Button';
import PageHeader from '@/components/ui/PageHeader';
import KPIStat from '@/components/ui/KPIStat';
import DataTable, { DataTableColumn } from '@/components/ui/DataTable';
import { requestStatusBadge } from '@/lib/dashboardUi';
import { ShoppingCart, Package, TrendingUp, Clock, Plus, Eye } from 'lucide-react';

type RequestRow = { id: string; title: string; status: string; proposals: number; created: string };

type SubData = {
  verificationStatus?: string;
  limits: { requestsPerMonth: number };
  usage: { requestsThisMonth: number };
};

export default function BuyerDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [allRequests, setAllRequests] = useState<RequestRow[]>([]);
  const [subscription, setSubscription] = useState<SubData | null>(null);

  useEffect(() => {
    const ct = (session?.user as { companyType?: string })?.companyType;
    if (status === 'authenticated' && ct === 'seller') {
      router.replace('/seller/dashboard');
    }
  }, [session, status, router]);

  useEffect(() => {
    if (status !== 'authenticated') return;
    fetch('/api/requests?buyerOnly=true')
      .then((res) => (res.ok ? res.json() : []))
      .then((data: RequestRow[]) => setAllRequests(data))
      .catch(() => {});
  }, [status]);

  useEffect(() => {
    if (status !== 'authenticated') return;
    fetch('/api/company/subscription')
      .then((res) => (res.ok ? res.json() : null))
      .then(setSubscription)
      .catch(() => {});
  }, [status]);

  const recentRequests = useMemo(() => allRequests.slice(0, 8), [allRequests]);
  const openCount = allRequests.filter((r) => r.status === 'open' || r.status === 'receiving').length;
  const totalProposals = allRequests.reduce((acc, r) => acc + r.proposals, 0);
  const pendingCount = allRequests.filter((r) => r.status === 'receiving').length;
  const remaining =
    subscription && subscription.limits.requestsPerMonth < 99999
      ? Math.max(0, subscription.limits.requestsPerMonth - subscription.usage.requestsThisMonth)
      : null;
  const isApproved = subscription?.verificationStatus === 'approved';

  const columns: DataTableColumn<RequestRow>[] = useMemo(
    () => [
      {
        key: 'title',
        header: 'Requisição',
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
        key: 'actions',
        header: '',
        align: 'right',
        render: (row) => (
          <Link href={`/buyer/requests/${row.id}`}>
            <Button variant="outline" size="sm">
              <Eye className="w-4 h-4 mr-1" />
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
      {subscription && subscription.verificationStatus && subscription.verificationStatus !== 'approved' && (
        <div className="mb-6 rounded-lg border border-warning-200 bg-warning-50 p-4 text-sm text-warning-800">
          Sua empresa está em análise de CNPJ. Você não pode criar requisições de compra até a aprovação.
        </div>
      )}

      <PageHeader
        title="Dashboard"
        description={
          session?.user?.name
            ? `Bem-vindo de volta, ${session.user.name}.`
            : 'Acompanhe suas requisições e propostas.'
        }
        actions={
          isApproved ? (
            <Link href="/buyer/create-request">
              <Button>
                <Plus className="mr-2 inline h-5 w-5" />
                Nova requisição
              </Button>
            </Link>
          ) : (
            <Button disabled title="Aguarde a aprovação do CNPJ para criar requisições">
              <Plus className="mr-2 inline h-5 w-5" />
              Nova requisição
            </Button>
          )
        }
      />

      <div className="mb-6 hidden sm:flex justify-end">
        <div className="relative h-14 w-14 shrink-0 opacity-90">
          <Image src="/mascote.png" alt="" role="presentation" fill className="object-contain" />
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPIStat
          label="Requisições ativas"
          value={openCount}
          icon={<Package className="h-5 w-5" />}
        />
        <KPIStat
          label="Propostas recebidas"
          value={totalProposals}
          icon={<ShoppingCart className="h-5 w-5" />}
        />
        <KPIStat
          label="Restantes no mês"
          value={remaining !== null ? remaining : 'Ilimitado'}
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <KPIStat
          label="Pendentes de resposta"
          value={pendingCount}
          icon={<Clock className="h-5 w-5" />}
        />
      </div>

      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-base font-semibold text-neutral-900">Requisições recentes</h2>
        <Link href="/buyer/requests" className="text-sm font-medium text-primary-600 hover:text-primary-700">
          Ver todas
        </Link>
      </div>
      <DataTable<RequestRow>
        columns={columns}
        rows={recentRequests}
        rowKey={(row) => row.id}
        density="comfortable"
        stickyHeader
        emptyTitle="Nenhuma requisição ainda"
        emptyDescription="Crie sua primeira requisição para receber propostas dos fornecedores."
        emptyAction={
          isApproved ? (
            <Link href="/buyer/create-request">
              <Button>Nova requisição</Button>
            </Link>
          ) : undefined
        }
      />
    </div>
  );
}
