'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Input from '@/components/Input';
import { Building2, Headphones, Search } from 'lucide-react';

type CompanyRow = {
  id: string;
  name: string;
  cnpjMasked: string;
  type: string;
  plan: string;
  billingShellState: string;
  allowBusinessActions: boolean;
};

export default function AssistantHubPage() {
  const router = useRouter();
  const { update } = useSession();
  const [companies, setCompanies] = useState<CompanyRow[]>([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [enteringId, setEnteringId] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const params = q.trim() ? `?q=${encodeURIComponent(q.trim())}` : '';
    setLoading(true);
    fetch(`/api/assistant/companies${params}`)
      .then((r) => r.json())
      .then((data) => {
        setCompanies(data.companies ?? []);
        setError('');
      })
      .catch(() => setError('Falha ao carregar empresas.'))
      .finally(() => setLoading(false));
  }, [q]);

  async function enterCompany(companyId: string) {
    setEnteringId(companyId);
    setError('');
    try {
      const res = await fetch('/api/assistant/context', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Não foi possível entrar na empresa.');
        return;
      }
      await update({
        actingCompanyId: data.sessionUpdate.actingCompanyId,
        actingCompanyType: data.sessionUpdate.actingCompanyType,
      });
      router.push(data.redirectTo ?? '/buyer/dashboard');
      router.refresh();
    } catch {
      setError('Erro de rede. Tente novamente.');
    } finally {
      setEnteringId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <div className="p-3 rounded-lg bg-primary-100 text-primary-700">
          <Headphones className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Central do assistente</h1>
          <p className="text-neutral-600 mt-1">
            Selecione a empresa cliente para atuar em requisições, propostas, equipe e assinatura.
            Dados sensíveis de due diligence e administração da plataforma não estão disponíveis.
          </p>
        </div>
      </div>

      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <Input
            placeholder="Buscar por nome ou CNPJ..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {error && (
        <p className="text-sm text-danger-700 bg-danger-50 border border-danger-100 rounded-md px-3 py-2">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-neutral-500">Carregando empresas...</p>
      ) : companies.length === 0 ? (
        <Card className="p-8 text-center text-neutral-600">
          Nenhuma empresa disponível. Peça ao administrador JADA para atribuir clientes à sua conta.
        </Card>
      ) : (
        <ul className="space-y-3">
          {companies.map((c) => (
            <li key={c.id}>
              <Card className="p-4 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0">
                  <Building2 className="w-5 h-5 text-neutral-400 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="font-semibold text-neutral-900 truncate">{c.name}</p>
                    <p className="text-sm text-neutral-500">
                      {c.cnpjMasked} · {c.type} · plano {c.plan}
                    </p>
                    <p className="text-xs text-neutral-500 mt-1">
                      Cobrança: {c.billingShellState}
                      {!c.allowBusinessActions ? ' (modo suporte ativo ao entrar)' : ''}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => enterCompany(c.id)}
                  disabled={enteringId === c.id}
                  className="shrink-0"
                >
                  {enteringId === c.id ? 'Entrando...' : 'Atuar nesta empresa'}
                </Button>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
