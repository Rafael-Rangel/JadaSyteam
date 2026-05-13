'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  Users,
  Package,
  TrendingUp,
  DollarSign,
  ArrowRight,
} from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import KPIStat from '@/components/ui/KPIStat';
import DataTable, { DataTableColumn } from '@/components/ui/DataTable';
import Badge from '@/components/ui/Badge';
import DonutChartCard from '@/components/charts/DonutChartCard';
import BarChartCard from '@/components/charts/BarChartCard';
import { chartColors } from '@/components/charts/ChartTheme';

type RecentCompany = {
  id: string;
  name: string;
  type: string;
  planName: string;
  createdAt: string;
};

type Stats = {
  totalCompanies: number;
  totalUsers: number;
  requestsThisMonth: number;
  proposalsThisMonth: number;
  revenueThisMonth: number;
  recentCompanies: RecentCompany[];
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

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then(setStats)
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  const distributionByType = useMemo(() => {
    if (!stats) return [];
    const counts: Record<string, number> = {};
    for (const c of stats.recentCompanies) {
      counts[c.type] = (counts[c.type] ?? 0) + 1;
    }
    return Object.entries(counts).map(([type, value]) => ({
      name: typeLabel[type] ?? type,
      value,
      color:
        type === 'buyer'
          ? chartColors.primary
          : type === 'seller'
            ? chartColors.accent
            : type === 'both'
              ? chartColors.warning
              : chartColors.neutral,
    }));
  }, [stats]);

  const distributionByPlan = useMemo(() => {
    if (!stats) return [];
    const counts: Record<string, number> = {};
    for (const c of stats.recentCompanies) {
      counts[c.planName] = (counts[c.planName] ?? 0) + 1;
    }
    return Object.entries(counts)
      .map(([plan, count]) => ({ plan, count }))
      .sort((a, b) => b.count - a.count);
  }, [stats]);

  const recentColumns: DataTableColumn<RecentCompany>[] = [
    {
      key: 'name',
      header: 'Empresa',
      render: (row) => (
        <div className="min-w-0">
          <p className="font-medium text-neutral-900 truncate">{row.name}</p>
          <p className="text-xs text-neutral-500">{row.planName}</p>
        </div>
      ),
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
        title="Dashboard"
        description="Visão geral de empresas, atividade e receita estimada da plataforma."
      />

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
        <KPIStat
          label="Empresas"
          value={stats ? formatNumber(stats.totalCompanies) : '—'}
          icon={<Building2 className="w-5 h-5" />}
          loading={loading}
        />
        <KPIStat
          label="Usuários"
          value={stats ? formatNumber(stats.totalUsers) : '—'}
          icon={<Users className="w-5 h-5" />}
          loading={loading}
        />
        <KPIStat
          label="Requisições · mês"
          value={stats ? formatNumber(stats.requestsThisMonth) : '—'}
          icon={<Package className="w-5 h-5" />}
          loading={loading}
        />
        <KPIStat
          label="Propostas · mês"
          value={stats ? formatNumber(stats.proposalsThisMonth) : '—'}
          icon={<TrendingUp className="w-5 h-5" />}
          loading={loading}
        />
        <KPIStat
          label="Faturamento · mês"
          value={stats ? formatCurrency(stats.revenueThisMonth) : '—'}
          hint="Estimado a partir das assinaturas ativas"
          icon={<DollarSign className="w-5 h-5" />}
          loading={loading}
        />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <BarChartCard
            title="Empresas recentes por plano"
            description="Distribuição das últimas empresas cadastradas pelos planos."
            loading={loading}
            data={distributionByPlan}
            xKey="plan"
            series={[{ key: 'count', label: 'Empresas', color: chartColors.primary }]}
          />
        </div>
        <DonutChartCard
          title="Tipo de empresa"
          description="Distribuição das últimas empresas por papel."
          loading={loading}
          data={distributionByType}
          centerLabel={
            distributionByType.length > 0
              ? formatNumber(distributionByType.reduce((s, d) => s + d.value, 0))
              : '0'
          }
        />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card card-padding-md">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-sm font-semibold text-neutral-900">Empresas recentes</h2>
                <p className="mt-0.5 text-xs text-neutral-500">
                  Últimos cadastros de companhias na plataforma.
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
              columns={recentColumns}
              rows={stats?.recentCompanies ?? []}
              rowKey={(r) => r.id}
              loading={loading}
              loadingRows={5}
              emptyTitle="Nenhuma empresa cadastrada"
              emptyDescription="Quando uma empresa se cadastrar, aparecerá aqui."
              density="compact"
              stickyHeader={false}
            />
          </div>
        </div>

        <div className="card card-padding-md">
          <h2 className="text-sm font-semibold text-neutral-900 mb-4">Atalhos</h2>
          <div className="space-y-2">
            <Link
              href="/admin/companies"
              className="block p-3 rounded-md border border-neutral-200 hover:border-primary-300 hover:bg-primary-50/40 transition-colors group focus-ring"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-900">Empresas</p>
                  <p className="text-xs text-neutral-500">
                    Aprovar, alterar plano e auditar
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-primary-600 transition-colors" />
              </div>
            </Link>
            <Link
              href="/admin/plans"
              className="block p-3 rounded-md border border-neutral-200 hover:border-primary-300 hover:bg-primary-50/40 transition-colors group focus-ring"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-900">Planos</p>
                  <p className="text-xs text-neutral-500">Limites, preços e features</p>
                </div>
                <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-primary-600 transition-colors" />
              </div>
            </Link>
            <Link
              href="/admin/financial"
              className="block p-3 rounded-md border border-neutral-200 hover:border-primary-300 hover:bg-primary-50/40 transition-colors group focus-ring"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-900">Financeiro</p>
                  <p className="text-xs text-neutral-500">Receita estimada por plano</p>
                </div>
                <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-primary-600 transition-colors" />
              </div>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
