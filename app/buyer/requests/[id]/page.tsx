'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Modal from '@/components/Modal';
import PageHeader from '@/components/ui/PageHeader';
import { requestStatusBadge } from '@/lib/dashboardUi';
import { Package, MapPin, Calendar, Check } from 'lucide-react';

type ProposalItem = {
  id: string;
  price: string;
  deliveryDays: string;
  details: string | null;
  seller: { name: string; id: string };
  status: string;
};

type RequestDetail = {
  id: string;
  title: string;
  description: string;
  quantity: string;
  unit: string;
  category: string;
  deliveryDate: string;
  address: string;
  city: string;
  state: string;
  status: string;
  proposals: ProposalItem[];
};

export default function RequestDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [request, setRequest] = useState<RequestDetail | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<string>('pending');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [selectedProposalId, setSelectedProposalId] = useState<string | null>(null);
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      fetch(`/api/requests/${id}`).then((res) => (res.ok ? res.json() : Promise.reject(new Error('Não encontrado')))),
      fetch('/api/company').then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([req, comp]) => {
        setRequest(req);
        setVerificationStatus((comp as { verificationStatus?: string })?.verificationStatus ?? 'pending');
      })
      .catch(() => setError('Requisição não encontrada.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAcceptProposal = (proposalId: string) => {
    setSelectedProposalId(proposalId);
    setShowAcceptModal(true);
  };

  const confirmAccept = async () => {
    if (!selectedProposalId) return;
    setAccepting(true);
    try {
      const res = await fetch('/api/proposals/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proposalId: selectedProposalId }),
      });
      if (!res.ok) throw new Error();
      setShowAcceptModal(false);
      router.push('/buyer/requests');
      router.refresh();
    } catch {
      setAccepting(false);
    }
  };

  if (loading || error) {
    return (
      <div>
        <PageHeader title="Requisição" description={loading ? 'Carregando…' : error || ''} />
        <Card>{loading ? <p className="text-neutral-600">Carregando…</p> : <p className="text-neutral-600">{error}</p>}</Card>
      </div>
    );
  }

  if (!request) return null;

  return (
    <div>
      <div className="mb-6">
        <Button variant="outline" onClick={() => router.back()}>
          ← Voltar
        </Button>
      </div>

      <PageHeader title={request.title} description="Detalhes e propostas recebidas." />

      {verificationStatus !== 'approved' && (
        <div className="mb-6 rounded-lg border border-warning-200 bg-warning-50 p-4 text-sm text-warning-800">
          Sua empresa está em análise de CNPJ. Você não pode aceitar propostas até a aprovação.
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Card>
            <h2 className="mb-4 text-lg font-semibold text-neutral-900">Detalhes</h2>
            <div className="space-y-4">
              <p className="text-neutral-700">{request.description}</p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-neutral-400" />
                  <span className="text-neutral-600">
                    <strong className="text-neutral-800">Quantidade:</strong> {request.quantity} {request.unit}
                  </span>
                </div>
                <p className="text-neutral-600">
                  <strong className="text-neutral-800">Categoria:</strong> {request.category}
                </p>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-neutral-400" />
                  <span className="text-neutral-600">
                    <strong className="text-neutral-800">Prazo:</strong> {request.deliveryDate}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-neutral-400" />
                  <span className="text-neutral-600">
                    {request.address}, {request.city} - {request.state}
                  </span>
                </div>
              </div>
              <div className="border-t border-neutral-200 pt-4">{requestStatusBadge(request.status)}</div>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-neutral-900">
              Propostas recebidas ({request.proposals.length})
            </h2>
            <p className="text-sm text-neutral-600">Compare e escolha a melhor proposta</p>
          </div>

          <div className="space-y-4">
            {request.proposals.map((proposal) => (
              <Card key={proposal.id}>
                <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-900">{proposal.seller.name}</h3>
                  </div>
                  <div className="text-left sm:text-right">
                    <div className="text-2xl font-bold text-primary-600">R$ {proposal.price}</div>
                    <div className="text-sm text-neutral-600">{proposal.deliveryDays} dias úteis</div>
                  </div>
                </div>
                {proposal.details && <p className="mb-4 text-neutral-700">{proposal.details}</p>}
                {request.status === 'open' || request.status === 'receiving' ? (
                  <div className="flex flex-wrap gap-2">
                    {verificationStatus === 'approved' ? (
                      <Button variant="success" onClick={() => handleAcceptProposal(proposal.id)}>
                        <Check className="mr-1 h-4 w-4" />
                        Aceitar proposta
                      </Button>
                    ) : (
                      <Button variant="success" disabled title="Aguarde a aprovação do CNPJ para aceitar propostas">
                        <Check className="mr-1 h-4 w-4" />
                        Aceitar proposta
                      </Button>
                    )}
                  </div>
                ) : null}
              </Card>
            ))}
          </div>
        </div>
      </div>

      <Modal isOpen={showAcceptModal} onClose={() => setShowAcceptModal(false)} title="Confirmar aceite" size="md">
        <div className="space-y-4">
          <p className="text-neutral-700">
            Ao aceitar esta proposta, o contato do vendedor será liberado e você poderá finalizar o negócio.
          </p>
          <div className="flex gap-4 pt-4">
            <Button variant="outline" onClick={() => setShowAcceptModal(false)} className="flex-1">
              Cancelar
            </Button>
            <Button variant="success" onClick={confirmAccept} className="flex-1" isLoading={accepting}>
              Confirmar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
