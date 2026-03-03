'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Modal from '@/components/Modal';
import { Search, Edit, Check, X, RefreshCw, FileText } from 'lucide-react';

type Company = {
  id: string;
  name: string;
  cnpj: string | null;
  type: string;
  plan: string;
  planName: string;
  verificationStatus: string;
  verifiedAt: string | null;
  createdAt: string;
  usersCount: number;
  requestsCount: number;
  proposalsCount: number;
};

type PlanOption = { slug: string; name: string };

function VerificationDetailContent({
  company,
  payload,
  onClose,
  onApprove,
  onReject,
  onReverify,
  isUpdating,
  isVerifying,
}: {
  company: Company;
  payload: Record<string, unknown> | null;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
  onReverify: () => void;
  isUpdating: boolean;
  isVerifying: boolean;
}) {
  const formatCurrency = (v: unknown) => {
    if (v == null) return '—';
    const n = typeof v === 'number' ? v : parseFloat(String(v));
    if (isNaN(n)) return String(v);
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n);
  };
  const formatDate = (v: unknown) => {
    if (!v || typeof v !== 'string') return '—';
    try {
      return new Date(v).toLocaleDateString('pt-BR');
    } catch {
      return String(v);
    }
  };
  const getVerificationBadge = (status: string) => {
    const map: Record<string, { label: string; class: string }> = {
      pending: { label: 'Em análise', class: 'badge-warning' },
      approved: { label: 'Aprovado', class: 'badge-success' },
      rejected: { label: 'Rejeitado', class: 'badge-danger' },
    };
    const t = map[status] || map.pending;
    return <span className={`badge ${t.class}`}>{t.label}</span>;
  };

  const p = payload || {};
  const situacao = String(p.descricao_situacao_cadastral ?? p.situacao_cadastral ?? '—').trim() || 'Não informada';
  const razaoSocial = String(p.razao_social ?? '—');
  const nomeFantasia = p.nome_fantasia ? String(p.nome_fantasia) : null;
  const cnaeDesc = p.cnae_fiscal_descricao ? String(p.cnae_fiscal_descricao) : '';
  const cnaeCod = p.cnae_fiscal != null ? String(p.cnae_fiscal) : '';
  const cnae = cnaeDesc || cnaeCod ? `${cnaeDesc}${cnaeDesc && cnaeCod ? ` (${cnaeCod})` : cnaeCod ? `(${cnaeCod})` : ''}`.trim() || '—' : '—';
  const natureza = String(p.natureza_juridica ?? '—');
  const capital = p.capital_social != null ? formatCurrency(p.capital_social) : '—';
  const porte = String(p.descricao_porte ?? p.porte ?? '—');
  const dataAbertura = formatDate(p.data_inicio_atividade);
  const dataSituacao = formatDate(p.data_situacao_cadastral);
  const matrizFilial = String(p.descricao_identificador_matriz_filial ?? p.identificador_matriz_filial ?? '—');
  const logradouro = [p.descricao_tipo_de_logradouro, p.logradouro, p.numero, p.complemento].filter(Boolean).map(String).join(' ').trim() || '—';
  const bairro = String(p.bairro ?? '—');
  const cidade = [p.municipio, p.uf].filter(Boolean).map(String).join(' / ').trim() || '—';
  const cep = p.cep ? String(p.cep).replace(/^(\d{5})(\d{3})$/, '$1-$2') : '—';
  const telefone = p.ddd_telefone_1 ? `(${String(p.ddd_telefone_1).slice(0, 2)}) ${String(p.ddd_telefone_1).slice(2)}` : '—';
  const email = p.email ? String(p.email) : '—';
  const qsa = Array.isArray(p.qsa) ? (p.qsa as { nome_socio?: string; qualificacao_socio?: string }[]) : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2 border-b border-gray-200 pb-4">
        <div>
          <h3 className="font-semibold text-gray-900">{company.name}</h3>
          <p className="text-sm text-gray-600">CNPJ: {company.cnpj || '—'}</p>
          <p className="text-sm text-gray-600 mt-1">
            Status atual: {getVerificationBadge(company.verificationStatus)}
            {company.verifiedAt && (
              <> · Verificado em {new Date(company.verifiedAt).toLocaleDateString('pt-BR')} às {new Date(company.verifiedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</>
            )}
          </p>
        </div>
      </div>

      {!payload ? (
        <p className="text-gray-500 py-4">Nenhum dado de verificação disponível. Use &quot;Reverificar&quot; para consultar a BrasilAPI.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Situação cadastral</h4>
            <div className="space-y-2 text-sm">
              <p><span className="text-gray-600">Situação:</span> <strong>{situacao}</strong></p>
              <p><span className="text-gray-600">Razão social:</span> {razaoSocial}</p>
              {nomeFantasia && <p><span className="text-gray-600">Nome fantasia:</span> {nomeFantasia}</p>}
              <p><span className="text-gray-600">Matriz/Filial:</span> {matrizFilial}</p>
              <p><span className="text-gray-600">Data início atividade:</span> {dataAbertura}</p>
              <p><span className="text-gray-600">Data situação cadastral:</span> {dataSituacao}</p>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Atividade e porte</h4>
            <div className="space-y-2 text-sm">
              <p><span className="text-gray-600">CNAE principal:</span> {cnae}</p>
              <p><span className="text-gray-600">Natureza jurídica:</span> {natureza}</p>
              <p><span className="text-gray-600">Porte:</span> {porte}</p>
              <p><span className="text-gray-600">Capital social:</span> {capital}</p>
            </div>
          </div>
          <div className="md:col-span-2">
            <h4 className="font-medium text-gray-900 mb-3">Endereço e contato</h4>
            <div className="space-y-2 text-sm">
              <p><span className="text-gray-600">Logradouro:</span> {logradouro}</p>
              <p><span className="text-gray-600">Bairro:</span> {bairro}</p>
              <p><span className="text-gray-600">Município / UF:</span> {cidade}</p>
              <p><span className="text-gray-600">CEP:</span> {cep}</p>
              <p><span className="text-gray-600">Telefone:</span> {telefone}</p>
              {email !== '—' && <p><span className="text-gray-600">E-mail:</span> {email}</p>}
            </div>
          </div>
          {qsa.length > 0 && (
            <div className="md:col-span-2">
              <h4 className="font-medium text-gray-900 mb-3">Quadro de sócios e administradores (QSA)</h4>
              <div className="overflow-x-auto max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left py-2 px-3 font-medium text-gray-700">Nome</th>
                      <th className="text-left py-2 px-3 font-medium text-gray-700">Qualificação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {qsa.slice(0, 20).map((s, i) => (
                      <tr key={i} className="border-b border-gray-100">
                        <td className="py-2 px-3">{String(s.nome_socio ?? '—')}</td>
                        <td className="py-2 px-3">{String(s.qualificacao_socio ?? '—')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {qsa.length > 20 && <p className="text-xs text-gray-500 p-2">Mostrando 20 de {qsa.length} sócios</p>}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex justify-between items-center gap-2 pt-4 border-t border-gray-200 flex-wrap">
        <Button variant="outline" size="sm" onClick={onReverify} disabled={isVerifying}>
          <RefreshCw className={`w-4 h-4 mr-1 ${isVerifying ? 'animate-spin' : ''}`} />
          Reverificar
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
          {company.verificationStatus !== 'approved' && (
            <Button variant="success" onClick={onApprove} disabled={isUpdating}>
              <Check className="w-4 h-4 mr-1" />
              Aprovar
            </Button>
          )}
          {company.verificationStatus !== 'rejected' && (
            <Button variant="outline" onClick={onReject} disabled={isUpdating}>
              <X className="w-4 h-4 mr-1" />
              Rejeitar
            </Button>
          )}
        </div>
      </div>
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
  const [activeTab, setActiveTab] = useState<'approved' | 'not-approved' | 'all'>('not-approved');
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [newPlan, setNewPlan] = useState('');
  const [saving, setSaving] = useState(false);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);
  const [verificationModal, setVerificationModal] = useState<{ company: Company; payload: Record<string, unknown> | null } | null>(null);

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
      ? companies.filter((c) => c.verificationStatus !== 'approved')
      : activeTab === 'approved'
        ? companies.filter((c) => c.verificationStatus === 'approved')
        : companies;

  const getTypeBadge = (type: string) => {
    const types: Record<string, { label: string; class: string }> = {
      buyer: { label: 'Comprador', class: 'badge-info' },
      seller: { label: 'Vendedor', class: 'badge-secondary' },
      both: { label: 'Ambos', class: 'badge-warning' },
    };
    const t = types[type] || types.buyer;
    return <span className={`badge ${t.class}`}>{t.label}</span>;
  };

  const getVerificationBadge = (status: string) => {
    const map: Record<string, { label: string; class: string }> = {
      pending: { label: 'Em análise', class: 'badge-warning' },
      approved: { label: 'Aprovado', class: 'badge-success' },
      rejected: { label: 'Rejeitado', class: 'badge-danger' },
    };
    const t = map[status] || map.pending;
    return <span className={`badge ${t.class}`}>{t.label}</span>;
  };

  const handleSetVerification = (companyId: string, status: 'approved' | 'rejected') => {
    setStatusUpdatingId(companyId);
    fetch(`/api/admin/companies/${companyId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ verificationStatus: status }),
    })
      .then((res) => (res.ok ? undefined : res.json().then((e) => Promise.reject(e))))
      .then(() => loadCompanies())
      .catch(() => {})
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
                verifiedAt: (dbData.verifiedAt as string | null) ?? company.verifiedAt,
              }
            : company,
          payload,
        });
      })
      .catch(() => {
        setVerificationModal({
          company,
          payload: null,
        });
      });
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

  return (
    <div className="min-h-screen flex flex-col">
      <Header userType="admin" userName="Admin" />

      <main className="flex-grow py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Empresas</h1>
            <p className="text-gray-600 mt-1">Gerencie todas as empresas cadastradas</p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex border-b border-gray-200 -mb-px">
              <button
                type="button"
                onClick={() => setActiveTab('not-approved')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'not-approved'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Não aprovadas
                <span className="ml-2 text-xs bg-gray-200 text-gray-600 rounded-full px-2 py-0.5">
                  {companies.filter((c) => c.verificationStatus !== 'approved').length}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('approved')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'approved'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Aprovadas
                <span className="ml-2 text-xs bg-gray-200 text-gray-600 rounded-full px-2 py-0.5">
                  {companies.filter((c) => c.verificationStatus === 'approved').length}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'all'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Todas
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 min-w-[160px] max-w-xs">
                <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar nome ou CNPJ"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 py-1.5 text-sm"
                />
              </div>
              <select
                className="input py-1.5 text-sm w-auto"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="all">Tipo</option>
                <option value="buyer">Comprador</option>
                <option value="seller">Vendedor</option>
                <option value="both">Ambos</option>
              </select>
              <select
                className="input py-1.5 text-sm w-auto"
                value={planFilter}
                onChange={(e) => setPlanFilter(e.target.value)}
              >
                <option value="all">Plano</option>
                {planOptions.map((p) => (
                  <option key={p.slug} value={p.slug}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Card>
            {loading ? (
              <p className="py-8 text-center text-gray-600">Carregando...</p>
            ) : filteredCompanies.length === 0 ? (
              <p className="py-8 text-center text-gray-500">Nenhuma empresa encontrada.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Empresa</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">CNPJ</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Tipo</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Plano</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-900">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCompanies.map((company) => (
                      <tr key={company.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-900">{company.name}</div>
                          <div className="text-xs text-gray-500">
                            {new Date(company.createdAt).toLocaleDateString('pt-BR')}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">{company.cnpj || '—'}</td>
                        <td className="py-3 px-4">{getTypeBadge(company.type)}</td>
                        <td className="py-3 px-4">{getVerificationBadge(company.verificationStatus)}</td>
                        <td className="py-3 px-4 text-sm text-gray-700">{company.planName}</td>
                        <td className="py-3 px-4">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenVerification(company)}
                              title="Relatório de verificação CNPJ"
                            >
                              <FileText className="w-4 h-4 mr-1" />
                              Relatório
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleOpenEdit(company)}>
                              <Edit className="w-4 h-4 mr-1" />
                              Plano
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </main>

      <Modal
        isOpen={!!verificationModal}
        onClose={() => setVerificationModal(null)}
        title="Dados da verificação de CNPJ"
        size="lg"
      >
        {verificationModal && (
          <VerificationDetailContent
            company={verificationModal.company}
            payload={verificationModal.payload}
            onClose={() => setVerificationModal(null)}
            onApprove={() => {
              handleSetVerification(verificationModal.company.id, 'approved');
              setVerificationModal(null);
            }}
            onReject={() => {
              handleSetVerification(verificationModal.company.id, 'rejected');
              setVerificationModal(null);
            }}
            onReverify={() => handleReverify(verificationModal.company.id)}
            isUpdating={statusUpdatingId === verificationModal.company.id}
            isVerifying={verifyingId === verificationModal.company.id}
          />
        )}
      </Modal>

      <Modal
        isOpen={!!editingCompany}
        onClose={() => setEditingCompany(null)}
        title="Alterar plano da empresa"
      >
        {editingCompany && (
          <div className="space-y-4">
            <p className="text-gray-600">
              Empresa: <strong>{editingCompany.name}</strong>. Plano atual: {editingCompany.planName}.
            </p>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Novo plano</span>
              <select
                className="input mt-1 w-full"
                value={newPlan}
                onChange={(e) => setNewPlan(e.target.value)}
              >
                {planOptions.map((p) => (
                  <option key={p.slug} value={p.slug}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setEditingCompany(null)}>
                Cancelar
              </Button>
              <Button onClick={handleSavePlan} disabled={saving || newPlan === editingCompany.plan}>
                {saving ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Footer />
    </div>
  );
}
