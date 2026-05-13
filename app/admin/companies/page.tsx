'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Search,
  Check,
  X,
  RefreshCw,
  FileText,
  Edit,
  ShieldCheck,
  Activity,
  Scale,
} from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import Tabs from '@/components/ui/Tabs';
import Badge from '@/components/ui/Badge';
import DataTable, { DataTableColumn } from '@/components/ui/DataTable';
import ActionMenu, { ActionMenuItem } from '@/components/ui/ActionMenu';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Modal from '@/components/Modal';

type Company = {
  id: string;
  name: string;
  cnpj: string | null;
  type: string;
  plan: string;
  planName: string;
  approvalStatus: string;
  verificationStatus: string;
  billingStatus: string | null;
  riskLevel: string;
  serasaScore: number | null;
  lastDueDiligenceAt: string | null;
  verifiedAt: string | null;
  createdAt: string;
  usersCount: number;
  requestsCount: number;
  proposalsCount: number;
};

type PlanOption = { slug: string; name: string };

type Tab = 'not-approved' | 'approved' | 'all';

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

const approvalLabel: Record<string, string> = {
  approved: 'Aprovada',
  pending: 'Em análise',
  rejected: 'Rejeitada',
};

const approvalTone: Record<string, 'success' | 'warning' | 'danger'> = {
  approved: 'success',
  pending: 'warning',
  rejected: 'danger',
};

const riskLabel: Record<string, string> = {
  low: 'Baixo',
  medium: 'Médio',
  high: 'Alto',
  unknown: 'Não avaliado',
};

const riskTone: Record<string, 'success' | 'warning' | 'danger' | 'neutral'> = {
  low: 'success',
  medium: 'warning',
  high: 'danger',
  unknown: 'neutral',
};

function formatCnpj(cnpj: string | null): string {
  if (!cnpj) return '—';
  const digits = cnpj.replace(/\D/g, '');
  if (digits.length !== 14) return cnpj;
  return digits.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
}

function formatDate(s?: string | null): string {
  if (!s) return '—';
  try {
    return new Date(s).toLocaleDateString('pt-BR');
  } catch {
    return '—';
  }
}

function formatCurrency(v: unknown) {
  if (v == null) return '—';
  const n = typeof v === 'number' ? v : parseFloat(String(v));
  if (Number.isNaN(n)) return String(v);
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n);
}

function VerificationDetailContent({
  company,
  payload,
}: {
  company: Company;
  payload: Record<string, unknown> | null;
}) {
  const p = payload || {};
  const situacao =
    String(p.descricao_situacao_cadastral ?? p.situacao_cadastral ?? '—').trim() ||
    'Não informada';
  const razaoSocial = String(p.razao_social ?? '—');
  const nomeFantasia = p.nome_fantasia ? String(p.nome_fantasia) : null;
  const cnaeDesc = p.cnae_fiscal_descricao ? String(p.cnae_fiscal_descricao) : '';
  const cnaeCod = p.cnae_fiscal != null ? String(p.cnae_fiscal) : '';
  const cnae =
    cnaeDesc || cnaeCod
      ? `${cnaeDesc}${cnaeDesc && cnaeCod ? ` (${cnaeCod})` : cnaeCod ? `(${cnaeCod})` : ''}`.trim() ||
        '—'
      : '—';
  const natureza = String(p.natureza_juridica ?? '—');
  const capital = p.capital_social != null ? formatCurrency(p.capital_social) : '—';
  const porte = String(p.descricao_porte ?? p.porte ?? '—');
  const dataAbertura = formatDate(typeof p.data_inicio_atividade === 'string' ? (p.data_inicio_atividade as string) : null);
  const dataSituacao = formatDate(typeof p.data_situacao_cadastral === 'string' ? (p.data_situacao_cadastral as string) : null);
  const matrizFilial = String(
    p.descricao_identificador_matriz_filial ?? p.identificador_matriz_filial ?? '—'
  );
  const logradouro =
    [p.descricao_tipo_de_logradouro, p.logradouro, p.numero, p.complemento]
      .filter(Boolean)
      .map(String)
      .join(' ')
      .trim() || '—';
  const bairro = String(p.bairro ?? '—');
  const cidade = [p.municipio, p.uf].filter(Boolean).map(String).join(' / ').trim() || '—';
  const cep = p.cep ? String(p.cep).replace(/^(\d{5})(\d{3})$/, '$1-$2') : '—';
  const telefone = p.ddd_telefone_1
    ? `(${String(p.ddd_telefone_1).slice(0, 2)}) ${String(p.ddd_telefone_1).slice(2)}`
    : '—';
  const email = p.email ? String(p.email) : '—';
  const qsa = Array.isArray(p.qsa)
    ? (p.qsa as { nome_socio?: string; qualificacao_socio?: string }[])
    : [];

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-neutral-200">
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-neutral-900 truncate">{company.name}</h3>
          <p className="mt-0.5 text-xs text-neutral-500">
            CNPJ <span className="font-mono">{formatCnpj(company.cnpj)}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone={approvalTone[company.approvalStatus] ?? 'warning'}>
            {approvalLabel[company.approvalStatus] ?? 'Em análise'}
          </Badge>
          {company.verifiedAt && (
            <span className="text-[11px] text-neutral-500">
              Verificada em {formatDate(company.verifiedAt)}
            </span>
          )}
        </div>
      </header>

      {!payload ? (
        <div className="surface card-padding-md text-sm text-neutral-500">
          Nenhum dado de verificação disponível. Use “Reverificar” para consultar a BrasilAPI.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="surface card-padding-md">
            <h4 className="text-sm font-semibold text-neutral-900 mb-3">Situação cadastral</h4>
            <dl className="space-y-2 text-sm">
              <Row label="Situação" value={<span className="font-medium text-neutral-900">{situacao}</span>} />
              <Row label="Razão social" value={razaoSocial} />
              {nomeFantasia && <Row label="Nome fantasia" value={nomeFantasia} />}
              <Row label="Matriz / Filial" value={matrizFilial} />
              <Row label="Início atividade" value={dataAbertura} />
              <Row label="Data situação" value={dataSituacao} />
            </dl>
          </div>

          <div className="surface card-padding-md">
            <h4 className="text-sm font-semibold text-neutral-900 mb-3">Atividade e porte</h4>
            <dl className="space-y-2 text-sm">
              <Row label="CNAE principal" value={cnae} />
              <Row label="Natureza jurídica" value={natureza} />
              <Row label="Porte" value={porte} />
              <Row label="Capital social" value={capital} />
            </dl>
          </div>

          <div className="surface card-padding-md md:col-span-2">
            <h4 className="text-sm font-semibold text-neutral-900 mb-3">Endereço e contato</h4>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <Row label="Logradouro" value={logradouro} />
              <Row label="Bairro" value={bairro} />
              <Row label="Município / UF" value={cidade} />
              <Row label="CEP" value={cep} />
              <Row label="Telefone" value={telefone} />
              {email !== '—' && <Row label="E-mail" value={email} />}
            </dl>
          </div>

          {qsa.length > 0 && (
            <div className="surface card-padding-md md:col-span-2">
              <h4 className="text-sm font-semibold text-neutral-900 mb-3">
                Quadro de sócios e administradores
              </h4>
              <div className="overflow-x-auto max-h-56 overflow-y-auto rounded-md border border-neutral-200">
                <table className="w-full text-sm">
                  <thead className="bg-neutral-50/80 sticky top-0">
                    <tr className="border-b border-neutral-200">
                      <th className="text-left py-2 px-3 text-xs font-medium uppercase tracking-wider text-neutral-500">
                        Nome
                      </th>
                      <th className="text-left py-2 px-3 text-xs font-medium uppercase tracking-wider text-neutral-500">
                        Qualificação
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {qsa.slice(0, 20).map((s, i) => (
                      <tr key={i} className="border-b border-neutral-100 last:border-0">
                        <td className="py-2 px-3 text-neutral-800">
                          {String(s.nome_socio ?? '—')}
                        </td>
                        <td className="py-2 px-3 text-neutral-600">
                          {String(s.qualificacao_socio ?? '—')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {qsa.length > 20 && (
                  <p className="text-[11px] text-neutral-500 px-3 py-2">
                    Mostrando 20 de {qsa.length} sócios.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline gap-2">
      <dt className="text-xs text-neutral-500 min-w-[120px]">{label}</dt>
      <dd className="text-sm text-neutral-700 break-words">{value}</dd>
    </div>
  );
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [planOptions, setPlanOptions] = useState<PlanOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');
  const [activeTab, setActiveTab] = useState<Tab>('not-approved');
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [newPlan, setNewPlan] = useState('');
  const [saving, setSaving] = useState(false);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);
  const [dueDiligenceUpdatingId, setDueDiligenceUpdatingId] = useState<string | null>(null);
  const [serasaUpdatingId, setSerasaUpdatingId] = useState<string | null>(null);
  const [escavadorUpdatingId, setEscavadorUpdatingId] = useState<string | null>(null);
  const [verificationModal, setVerificationModal] = useState<{
    company: Company;
    payload: Record<string, unknown> | null;
  } | null>(null);

  useEffect(() => {
    fetch('/api/admin/plans')
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((list: { slug: string; name: string }[]) =>
        setPlanOptions(list.map((p) => ({ slug: p.slug, name: p.name })))
      )
      .catch(() => setPlanOptions([]));
  }, []);

  const loadCompanies = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (typeFilter !== 'all') params.set('type', typeFilter);
    if (planFilter !== 'all') params.set('plan', planFilter);
    fetch(`/api/admin/companies?${params}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then(setCompanies)
      .catch(() => setCompanies([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCompanies();
  }, [searchTerm, typeFilter, planFilter, activeTab]);

  const filteredCompanies =
    activeTab === 'not-approved'
      ? companies.filter((c) => c.approvalStatus !== 'approved')
      : activeTab === 'approved'
        ? companies.filter((c) => c.approvalStatus === 'approved')
        : companies;

  const tabsCounts = useMemo(() => {
    const pendentes = companies.filter((c) => c.approvalStatus !== 'approved').length;
    const aprovadas = companies.filter((c) => c.approvalStatus === 'approved').length;
    return { pendentes, aprovadas, total: companies.length };
  }, [companies]);

  const handleSetVerification = (companyId: string, status: 'approved' | 'rejected') => {
    setStatusUpdatingId(companyId);
    fetch(`/api/admin/companies/${companyId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        approvalStatus: status,
        verificationStatus: status === 'approved' ? 'approved' : undefined,
      }),
    })
      .then((res) => (res.ok ? undefined : res.json().then((e) => Promise.reject(e))))
      .then(() => loadCompanies())
      .catch((e) => {
        const msg =
          (e && typeof e.error === 'string' && e.error) ||
          'Não foi possível atualizar a empresa.';
        window.alert(msg);
      })
      .finally(() => setStatusUpdatingId(null));
  };

  const handleReverify = (companyId: string) => {
    setVerifyingId(companyId);
    fetch(`/api/admin/companies/${companyId}/verify`, { method: 'POST' })
      .then((res) => (res.ok ? undefined : res.json().then((e) => Promise.reject(e))))
      .then(() => loadCompanies())
      .catch(() => {})
      .finally(() => setVerifyingId(null));
  };

  const handleOpenVerification = (company: Company) => {
    const cnpjDigits = (company.cnpj ?? '').replace(/\D/g, '');

    Promise.all([
      fetch(`/api/admin/companies/${company.id}`).then((res) => (res.ok ? res.json() : null)),
      cnpjDigits.length === 14
        ? fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpjDigits}`).then((res) =>
            res.ok ? res.json() : null
          )
        : Promise.resolve(null),
    ])
      .then(([dbData, liveData]) => {
        const dbPayload =
          dbData && typeof dbData.verificationPayload === 'object'
            ? (dbData.verificationPayload as Record<string, unknown>)
            : null;
        const payload =
          (liveData && typeof liveData === 'object'
            ? (liveData as Record<string, unknown>)
            : null) || dbPayload;
        setVerificationModal({
          company: dbData
            ? {
                ...company,
                verificationStatus:
                  (dbData.verificationStatus as string) ?? company.verificationStatus,
                approvalStatus: (dbData.approvalStatus as string) ?? company.approvalStatus,
                billingStatus: (dbData.billingStatus as string | null) ?? company.billingStatus,
                verifiedAt: (dbData.verifiedAt as string | null) ?? company.verifiedAt,
              }
            : company,
          payload,
        });
      })
      .catch(() => {
        setVerificationModal({ company, payload: null });
      });
  };

  const handleRunDueDiligence = (companyId: string) => {
    setDueDiligenceUpdatingId(companyId);
    fetch(`/api/admin/companies/${companyId}/due-diligence`, { method: 'POST' })
      .then((res) => (res.ok ? undefined : res.json().then((e) => Promise.reject(e))))
      .then(() => loadCompanies())
      .catch((e) => window.alert(e?.error || 'Falha ao executar due diligence.'))
      .finally(() => setDueDiligenceUpdatingId(null));
  };

  const handleRunSerasa = (companyId: string) => {
    setSerasaUpdatingId(companyId);
    fetch(`/api/admin/companies/${companyId}/serasa`, { method: 'POST' })
      .then((res) => (res.ok ? res.json() : res.json().then((e) => Promise.reject(e))))
      .then((data) => {
        loadCompanies();
        window.alert(
          `Consulta Serasa concluída. Score: ${data?.score ?? 'N/A'} · Risco: ${
            data?.riskLevel ?? 'unknown'
          }`
        );
      })
      .catch((e) => window.alert(e?.error || 'Falha ao consultar Serasa.'))
      .finally(() => setSerasaUpdatingId(null));
  };

  const handleRunEscavador = (companyId: string) => {
    setEscavadorUpdatingId(companyId);
    fetch(`/api/admin/companies/${companyId}/escavador`, { method: 'POST' })
      .then((res) => (res.ok ? res.json() : res.json().then((e) => Promise.reject(e))))
      .then((data) => {
        loadCompanies();
        window.alert(
          `Consulta Escavador concluída. Processos: ${data?.totalCases ?? '—'} · Risco: ${
            data?.riskLevel ?? 'unknown'
          } · Status: ${data?.status ?? '—'}`
        );
      })
      .catch((e) => window.alert(e?.error || 'Falha ao consultar Escavador.'))
      .finally(() => setEscavadorUpdatingId(null));
  };

  const handleOpenEdit = (company: Company) => {
    setEditingCompany(company);
    setNewPlan(company.plan);
  };

  const handleSavePlan = () => {
    if (!editingCompany || !newPlan) return;
    setSaving(true);
    fetch(`/api/admin/companies/${editingCompany.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan: newPlan }),
    })
      .then((res) => {
        if (!res.ok) return res.json().then((e) => Promise.reject(e));
        return res.json();
      })
      .then(() => {
        setEditingCompany(null);
        loadCompanies();
      })
      .catch(() => {})
      .finally(() => setSaving(false));
  };

  const columns: DataTableColumn<Company>[] = [
    {
      key: 'name',
      header: 'Empresa',
      render: (row) => (
        <div className="min-w-0">
          <p className="font-medium text-neutral-900 truncate">{row.name}</p>
          <p className="text-[11px] text-neutral-500 font-mono">{formatCnpj(row.cnpj)}</p>
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
      key: 'status',
      header: 'Status',
      render: (row) => (
        <Badge tone={approvalTone[row.approvalStatus] ?? 'warning'}>
          {approvalLabel[row.approvalStatus] ?? 'Em análise'}
        </Badge>
      ),
    },
    {
      key: 'risk',
      header: 'Risco',
      render: (row) => (
        <div className="flex flex-col gap-0.5">
          <Badge tone={riskTone[row.riskLevel] ?? 'neutral'}>
            {riskLabel[row.riskLevel] ?? '—'}
          </Badge>
          <span className="text-[11px] text-neutral-500 tabular-nums">
            Score {row.serasaScore ?? '—'}
          </span>
        </div>
      ),
    },
    {
      key: 'plan',
      header: 'Plano',
      render: (row) => <span className="text-sm text-neutral-700">{row.planName}</span>,
    },
    {
      key: 'createdAt',
      header: 'Cadastro',
      align: 'right',
      render: (row) => (
        <span className="text-xs text-neutral-500 tabular-nums">
          {formatDate(row.createdAt)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: <span className="sr-only">Ações</span>,
      align: 'right',
      width: '64px',
      render: (row) => {
        const items: ActionMenuItem[] = [
          {
            id: 'report',
            label: 'Relatório de verificação',
            icon: <FileText className="w-4 h-4" />,
            onClick: () => handleOpenVerification(row),
          },
          {
            id: 'plan',
            label: 'Alterar plano',
            icon: <Edit className="w-4 h-4" />,
            onClick: () => handleOpenEdit(row),
          },
          {
            id: 'verify',
            label: verifyingId === row.id ? 'Verificando...' : 'Reverificar CNPJ',
            icon: (
              <RefreshCw
                className={`w-4 h-4 ${verifyingId === row.id ? 'animate-spin' : ''}`}
              />
            ),
            onClick: () => handleReverify(row.id),
            disabled: verifyingId === row.id,
          },
          {
            id: 'due',
            label: dueDiligenceUpdatingId === row.id ? 'Executando...' : 'Due diligence',
            icon: <ShieldCheck className="w-4 h-4" />,
            onClick: () => handleRunDueDiligence(row.id),
            disabled: dueDiligenceUpdatingId === row.id,
          },
          {
            id: 'serasa',
            label: serasaUpdatingId === row.id ? 'Consultando...' : 'Consultar Serasa',
            icon: <Activity className="w-4 h-4" />,
            onClick: () => handleRunSerasa(row.id),
            disabled: serasaUpdatingId === row.id,
          },
          {
            id: 'escavador',
            label: escavadorUpdatingId === row.id ? 'Consultando...' : 'Consultar Escavador',
            icon: <Scale className="w-4 h-4" />,
            onClick: () => handleRunEscavador(row.id),
            disabled: escavadorUpdatingId === row.id,
          },
          ...(row.approvalStatus !== 'approved'
            ? [
                {
                  id: 'approve',
                  label: 'Aprovar',
                  icon: <Check className="w-4 h-4" />,
                  onClick: () => handleSetVerification(row.id, 'approved'),
                } as ActionMenuItem,
              ]
            : []),
          ...(row.approvalStatus !== 'rejected'
            ? [
                {
                  id: 'reject',
                  label: 'Rejeitar',
                  icon: <X className="w-4 h-4" />,
                  danger: true,
                  onClick: () => handleSetVerification(row.id, 'rejected'),
                } as ActionMenuItem,
              ]
            : []),
        ];
        return <ActionMenu items={items} />;
      },
    },
  ];

  return (
    <>
      <PageHeader
        title="Empresas"
        description="Aprove, monitore e audite as empresas cadastradas na plataforma."
      />

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <Tabs<Tab>
          items={[
            { id: 'not-approved', label: 'Pendentes', count: tabsCounts.pendentes },
            { id: 'approved', label: 'Aprovadas', count: tabsCounts.aprovadas },
            { id: 'all', label: 'Todas', count: tabsCounts.total },
          ]}
          value={activeTab}
          onChange={setActiveTab}
        />

        <div className="flex flex-wrap items-center gap-2">
          <div className="w-full sm:w-72">
            <Input
              placeholder="Buscar por nome ou CNPJ"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search className="w-4 h-4" />}
              inputSize="sm"
            />
          </div>
          <select
            className="input h-8 w-auto text-sm"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            aria-label="Filtrar por tipo"
          >
            <option value="all">Todos os tipos</option>
            <option value="buyer">Comprador</option>
            <option value="seller">Vendedor</option>
            <option value="both">Ambos</option>
          </select>
          <select
            className="input h-8 w-auto text-sm"
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            aria-label="Filtrar por plano"
          >
            <option value="all">Todos os planos</option>
            {planOptions.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <DataTable
        columns={columns}
        rows={filteredCompanies}
        rowKey={(r) => r.id}
        loading={loading}
        loadingRows={6}
        emptyTitle="Nenhuma empresa encontrada"
        emptyDescription="Ajuste os filtros ou aguarde novos cadastros."
      />

      {/* Modal de verificação */}
      <Modal
        isOpen={!!verificationModal}
        onClose={() => setVerificationModal(null)}
        title="Relatório de verificação de CNPJ"
        description="Dados consultados via BrasilAPI / Receita Federal."
        size="xl"
        footer={
          verificationModal ? (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Button
                variant="ghost"
                size="sm"
                leftIcon={
                  <RefreshCw
                    className={`w-4 h-4 ${
                      verifyingId === verificationModal.company.id ? 'animate-spin' : ''
                    }`}
                  />
                }
                onClick={() => handleReverify(verificationModal.company.id)}
                disabled={verifyingId === verificationModal.company.id}
              >
                Reverificar
              </Button>
              <div className="flex items-center gap-2">
                <Button variant="secondary" onClick={() => setVerificationModal(null)}>
                  Fechar
                </Button>
                {verificationModal.company.approvalStatus !== 'rejected' && (
                  <Button
                    variant="ghost"
                    leftIcon={<X className="w-4 h-4" />}
                    onClick={() => {
                      handleSetVerification(verificationModal.company.id, 'rejected');
                      setVerificationModal(null);
                    }}
                    disabled={statusUpdatingId === verificationModal.company.id}
                  >
                    Rejeitar
                  </Button>
                )}
                {verificationModal.company.approvalStatus !== 'approved' && (
                  <Button
                    variant="success"
                    leftIcon={<Check className="w-4 h-4" />}
                    onClick={() => {
                      handleSetVerification(verificationModal.company.id, 'approved');
                      setVerificationModal(null);
                    }}
                    disabled={statusUpdatingId === verificationModal.company.id}
                  >
                    Aprovar e gerar cobrança
                  </Button>
                )}
              </div>
            </div>
          ) : null
        }
      >
        {verificationModal && (
          <VerificationDetailContent
            company={verificationModal.company}
            payload={verificationModal.payload}
          />
        )}
      </Modal>

      {/* Modal alterar plano */}
      <Modal
        isOpen={!!editingCompany}
        onClose={() => setEditingCompany(null)}
        title="Alterar plano da empresa"
        size="sm"
        footer={
          editingCompany ? (
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setEditingCompany(null)}>
                Cancelar
              </Button>
              <Button
                onClick={handleSavePlan}
                isLoading={saving}
                disabled={saving || newPlan === editingCompany.plan}
              >
                Salvar
              </Button>
            </div>
          ) : null
        }
      >
        {editingCompany && (
          <div className="space-y-4">
            <div className="surface card-padding-sm">
              <p className="text-xs uppercase tracking-wider font-medium text-neutral-500">
                Empresa
              </p>
              <p className="mt-1 text-sm font-medium text-neutral-900">
                {editingCompany.name}
              </p>
              <p className="mt-0.5 text-xs text-neutral-500">
                Plano atual: <span className="font-medium">{editingCompany.planName}</span>
              </p>
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1.5">
                Novo plano
              </label>
              <select
                className="input"
                value={newPlan}
                onChange={(e) => setNewPlan(e.target.value)}
              >
                {planOptions.map((p) => (
                  <option key={p.slug} value={p.slug}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
