'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Card from '@/components/Card';
import { DollarSign } from 'lucide-react';

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

  const typeLabel: Record<string, string> = {
    buyer: 'Comprador',
    seller: 'Vendedor',
    both: 'Ambos',
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header userType="admin" userName="Admin" />

      <main className="flex-grow py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Financeiro</h1>
            <p className="text-gray-600 mt-1">
              Receita estimada por plano (assinaturas). Integração com gateway de pagamento em breve.
            </p>
          </div>

          {loading ? (
            <p className="text-gray-600">Carregando...</p>
          ) : !data ? (
            <p className="text-gray-500">Erro ao carregar dados.</p>
          ) : (
            <>
              <Card className="mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-success-100 text-success-600 flex items-center justify-center">
                    <DollarSign className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Receita mensal estimada</p>
                    <p className="text-2xl font-bold text-gray-900">
                      R$ {data.totalRevenue.toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <Card>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Por plano</h2>
                  <div className="space-y-3">
                    {data.byPlan.map((row) => (
                      <div
                        key={row.id}
                        className="flex justify-between items-center p-3 border border-gray-200 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-gray-900">{row.name}</p>
                          <p className="text-sm text-gray-500">
                            R$ {row.price.toLocaleString('pt-BR')}/mês • {row.companiesCount} empresa(s)
                          </p>
                        </div>
                        <p className="font-semibold text-gray-900">
                          R$ {row.revenue.toLocaleString('pt-BR')}
                        </p>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Últimas assinaturas</h2>
                  {data.subscriptions.length === 0 ? (
                    <p className="text-gray-500 text-sm">Nenhuma empresa cadastrada.</p>
                  ) : (
                    <div className="space-y-2">
                      {data.subscriptions.slice(0, 10).map((s) => (
                        <div
                          key={s.id}
                          className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0"
                        >
                          <div>
                            <p className="font-medium text-gray-900 text-sm">{s.name}</p>
                            <p className="text-xs text-gray-500">
                              {typeLabel[s.type] ?? s.type} • {s.plan}
                            </p>
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(s.createdAt).toLocaleDateString('pt-BR')}
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
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
