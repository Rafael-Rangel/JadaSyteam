'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Card from '@/components/Card';
import { Building, Users, Package, TrendingUp, DollarSign } from 'lucide-react';

type Stats = {
  totalCompanies: number;
  totalUsers: number;
  requestsThisMonth: number;
  proposalsThisMonth: number;
  revenueThisMonth: number;
  recentCompanies: { id: string; name: string; type: string; planName: string; createdAt: string }[];
};

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

  const typeLabel: Record<string, string> = {
    buyer: 'Comprador',
    seller: 'Vendedor',
    both: 'Ambos',
  };

  const statCards = stats
    ? [
        { label: 'Total de Empresas', value: String(stats.totalCompanies), icon: Building, color: 'primary' as const },
        { label: 'Usuários Ativos', value: String(stats.totalUsers), icon: Users, color: 'success' as const },
        { label: 'Requisições (mês)', value: String(stats.requestsThisMonth), icon: Package, color: 'warning' as const },
        { label: 'Propostas (mês)', value: String(stats.proposalsThisMonth), icon: TrendingUp, color: 'secondary' as const },
        {
          label: 'Faturamento estimado (mês)',
          value: `R$ ${stats.revenueThisMonth.toLocaleString('pt-BR')}`,
          icon: DollarSign,
          color: 'success' as const,
        },
      ]
    : [];

  const colorClasses: Record<string, string> = {
    primary: 'bg-primary-100 text-primary-600',
    success: 'bg-success-100 text-success-600',
    warning: 'bg-warning-100 text-warning-600',
    danger: 'bg-danger-100 text-danger-600',
    secondary: 'bg-secondary-100 text-secondary-600',
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header userType="admin" userName="Admin" />

      <main className="flex-grow py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Administrativo</h1>
            <p className="text-gray-600 mt-1">Visão geral da plataforma</p>
          </div>

          {loading ? (
            <p className="text-gray-600">Carregando...</p>
          ) : !stats ? (
            <p className="text-gray-600">Erro ao carregar dados.</p>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {statCards.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <Card key={index}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                          <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                        </div>
                        <div
                          className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[stat.color]}`}
                        >
                          <Icon className="w-6 h-6" />
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Empresas Recentes</h2>
                  {stats.recentCompanies.length === 0 ? (
                    <p className="text-gray-500 text-sm">Nenhuma empresa cadastrada.</p>
                  ) : (
                    <div className="space-y-3">
                      {stats.recentCompanies.map((company) => (
                        <div
                          key={company.id}
                          className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                        >
                          <div>
                            <p className="font-medium text-gray-900">{company.name}</p>
                            <p className="text-sm text-gray-600">
                              {typeLabel[company.type] ?? company.type} • {company.planName}
                            </p>
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(company.createdAt).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  <Link
                    href="/admin/companies"
                    className="inline-block mt-4 text-primary-600 hover:text-primary-700 font-medium text-sm"
                  >
                    Ver todas as empresas →
                  </Link>
                </Card>

                <Card>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Atalhos</h2>
                  <div className="space-y-3">
                    <Link
                      href="/admin/companies"
                      className="block p-3 bg-primary-50 border border-primary-200 rounded-lg hover:bg-primary-100"
                    >
                      <p className="font-medium text-primary-900">Empresas</p>
                      <p className="text-sm text-primary-700">Listar e alterar plano das empresas</p>
                    </Link>
                    <Link
                      href="/admin/plans"
                      className="block p-3 bg-primary-50 border border-primary-200 rounded-lg hover:bg-primary-100"
                    >
                      <p className="font-medium text-primary-900">Planos</p>
                      <p className="text-sm text-primary-700">Consultar limites e preços</p>
                    </Link>
                    <Link
                      href="/admin/financial"
                      className="block p-3 bg-success-50 border border-success-200 rounded-lg hover:bg-success-100"
                    >
                      <p className="font-medium text-success-900">Financeiro</p>
                      <p className="text-sm text-success-700">Receita estimada e visão por plano</p>
                    </Link>
                  </div>
                </Card>
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
