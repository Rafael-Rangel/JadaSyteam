'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Modal from '@/components/Modal';
import { Package, MapPin, Calendar, Check, X } from 'lucide-react';

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

const statusLabels: Record<string, string> = {
  open: 'Aberto',
  receiving: 'Recebendo Propostas',
  selected: 'Proposta Aceita',
  closed: 'Finalizado',
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
      <div className="min-h-screen flex flex-col">
        <Header userType="buyer" />
        <main className="flex-grow py-8 bg-gray-50 flex items-center justify-center">
          <Card className="max-w-md mx-auto">
            {loading ? <p className="text-gray-600">Carregando...</p> : <p className="text-gray-600">{error}</p>}
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  if (!request) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Header userType="buyer" />

      <main className="flex-grow py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Button variant="outline" onClick={() => router.back()} className="mb-6">
            ← Voltar
          </Button>

          {verificationStatus !== 'approved' && (
            <div className="mb-6 p-4 rounded-lg text-sm bg-warning-50 border border-warning-200 text-warning-800">
              Sua empresa está em análise de CNPJ. Você não pode aceitar propostas até a aprovação.
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <Card>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Detalhes da Requisição</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{request.title}</h3>
                    <p className="text-gray-600">{request.description}</p>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <Package className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">
                        <strong>Quantidade:</strong> {request.quantity} {request.unit}
                      </span>
                    </div>
                    <span className="text-gray-600"><strong>Categoria:</strong> {request.category}</span>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600"><strong>Prazo:</strong> {request.deliveryDate}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{request.address}, {request.city} - {request.state}</span>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-gray-200">
                    <span className="badge badge-warning">{statusLabels[request.status] || request.status}</span>
                  </div>
                </div>
              </Card>
            </div>

            <div className="lg:col-span-2">
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Propostas Recebidas ({request.proposals.length})</h2>
                <p className="text-gray-600 text-sm">Compare e escolha a melhor proposta</p>
              </div>

              <div className="space-y-4">
                {request.proposals.map((proposal) => (
                  <Card key={proposal.id}>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{proposal.seller.name}</h3>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary-600 mb-1">R$ {proposal.price}</div>
                        <div className="text-sm text-gray-600">{proposal.deliveryDays} dias úteis</div>
                      </div>
                    </div>
                    {proposal.details && <p className="text-gray-700 mb-4">{proposal.details}</p>}
                    {request.status === 'open' || request.status === 'receiving' ? (
                      <div className="flex items-center space-x-2">
                        {verificationStatus === 'approved' ? (
                          <Button variant="success" onClick={() => handleAcceptProposal(proposal.id)}>
                            <Check className="w-4 h-4 mr-1" />
                            Aceitar Proposta
                          </Button>
                        ) : (
                          <Button variant="success" disabled title="Aguarde a aprovação do CNPJ para aceitar propostas">
                            <Check className="w-4 h-4 mr-1" />
                            Aceitar Proposta
                          </Button>
                        )}
                      </div>
                    ) : null}
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Modal isOpen={showAcceptModal} onClose={() => setShowAcceptModal(false)} title="Confirmar Aceite da Proposta" size="md">
        <div className="space-y-4">
          <p className="text-gray-700">
            Ao aceitar esta proposta, o contato do vendedor será liberado e você poderá finalizar o negócio.
          </p>
          <div className="flex space-x-4 pt-4">
            <Button variant="outline" onClick={() => setShowAcceptModal(false)} className="flex-1">Cancelar</Button>
            <Button variant="success" onClick={confirmAccept} className="flex-1" isLoading={accepting}>
              Confirmar Aceite
            </Button>
          </div>
        </div>
      </Modal>

      <Footer />
    </div>
  );
}
