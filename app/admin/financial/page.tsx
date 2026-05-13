'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, DollarSign, TrendingUp, Users } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import KPIStat from '@/components/ui/KPIStat';
import DataTable, { DataTableColumn } from '@/components/ui/DataTable';
import Badge from '@/components/ui/Badge';
import BarChartCard from '@/components/charts/BarChartCard';
import { chartColors } from '@/components/charts/ChartTheme';

type PlanRow = {
  id: string;
  name: string;
  price: number;
  companiesCount: number;
  revenue: number;
};

type SubRow = {
  id: string;
  name: string;
  type: string;
  plan: string;
  createdAt: string;
};

type FinancialData = {
  totalRevenue: number;
  byPlan: PlanRow[];
  subscriptions: SubRow[];
};

const typeLabel: Record<string, string> = {
  buyer: 'Comprador',
  seller: 'Vendedor',
  both: 'Ambos',
};

const typeBadgeTone: Record<string, 'info' | 'accent' | 'warning' | 'neutral'> = {
  buyer: 'info',
  seller: 'accent',
  both: 'warning',
};

function formatCurrency(v: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(v);
}

function formatNumber(v: number) {
  return new Intl.NumberFormat('pt-BR').format(v);
}

export default function AdminFinancialPage() {
  const [data, setData] = useState<FinancialData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/financial')
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  const totalCompanies = useMemo(
    () => data?.byPlan.reduce((s, p) => s + p.companiesCount, 0) ?? 0,
    [data]
  );

  const avgTicket = useMemo(() => {
    if (!data) return 0;
    return totalCompanies > 0 ? Math.round(data.totalRevenue / totalCompanies) : 0;
  }, [data, totalCompanies]);

  const chartData = useMemo(() => {
    if (!data) return [];
    return data.byPlan
      .filter((p) => p.companiesCount > 0)
      .map((p) => ({ plan: p.name, receita: p.revenue }));
  }, [data]);

  const subColumns: DataTableColumn<SubRow>[] = [
    {
      key: 'name',
      header: 'Empresa',
      render: (row) => <span className="font-medium text-neutral-900">{row.name}</span>,
    },
    {
      key: 'type',
      header: 'Tipo',
      render: (row) => (
        <Badge tone={typeBadgeTone[row.type] ?? 'neutral'}>
          {typeLabel[row.type] ?? row.type}
        </Badge>
      ),
    },
    {
      key: 'plan',
      header: 'Plano',
      render: (row) => <span className="text-sm text-neutral-700">{row.plan}</span>,
    },
    {
      key: 'createdAt',
      header: 'Cadastro',
      align: 'right',
      render: (row) => (
        <span className="text-xs text-neutral-500 tabular-nums">
          {new Date(row.createdAt).toLocaleDateString('pt-BR')}
        </span>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Financeiro"
        description="Receita estimada por plano. A integração com gateway de pagamento real virá em breve."
      />

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <KPIStat
          label="Receita · mês"
          value={data ? formatCurrency(data.totalRevenue) : '—'}
          hint="Soma das assinaturas ativas"
          icon={<DollarSign className="w-5 h-5" />}
          loading={loading}
        />
        <KPIStat
          label="Empresas pagantes"
          value={data ? formatNumber(totalCompanies) : '—'}
          icon={<Users className="w-5 h-5" />}
          loading={loading}
        />
        <KPIStat
          label="Ticket médio"
          value={data ? formatCurrency(avgTicket) : '—'}
          icon={<TrendingUp className="w-5 h-5" />}
          loading={loading}
        />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <BarChartCard
            title="Receita por plano"
            description="Receita mensal estimada distribuída entre os planos ativos."
            loading={loading}
            data={chartData}
            xKey="plan"
            series={[{ key: 'receita', label: 'Receita', color: chartColors.primary }]}
            formatValue={(v) => formatCurrency(v)}
            height={300}
          />
        </div>

        <div className="card card-padding-md">
          <h2 className="text-sm font-semibold text-neutral-900 mb-4">Por plano</h2>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-14 skeleton rounded-md" />
              ))}
            </div>
          ) : !data || data.byPlan.length === 0 ? (
            <p className="text-sm text-neutral-500">Nenhum plano cadastrado.</p>
          ) : (
            <ul className="space-y-2">
              {data.byPlan.map((row) => (
                <li
                  key={row.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-md border border-neutral-200 hover:bg-neutral-50/60 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-neutral-900 truncate">
                      {row.name}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {formatCurrency(row.price)}/mês · {row.companiesCount} empresa(s)
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-neutral-900 tabular-nums">
                    {formatCurrency(row.revenue)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section>
        <div className="card card-padding-md mb-0">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-sm font-semibold text-neutral-900">Últimas assinaturas</h2>
              <p className="mt-0.5 text-xs text-neutral-500">
                As contas mais recentes na plataforma.
              </p>
            </div>
            <Link
              href="/admin/companies"
              className="inline-flex items-center gap-1 text-xs font-medium text-primary-700 hover:text-primary-800"
            >
              Ver todas <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <DataTable
            columns={subColumns}
            rows={data?.subscriptions.slice(0, 10) ?? []}
            rowKey={(r) => r.id}
            loading={loading}
            density="compact"
            stickyHeader={false}
            emptyTitle="Sem assinaturas"
            emptyDescription="Quando uma empresa assinar, aparecerá aqui."
          />
        </div>
      </section>
    </>
  );
}
