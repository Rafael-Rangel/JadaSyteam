'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Modal from '@/components/Modal';
import { Package, MapPin, Calendar, DollarSign, Send, Check } from 'lucide-react';

type OpportunityDetail = {
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
  buyer: { name: string };
  myProposal: { id: string; status: string } | null;
};

export default function OpportunityDetailPage({ params }: { params: { id: string } }) {
  const id = params.id;
  const router = useRouter();
  const [opportunity, setOpportunity] = useState<OpportunityDetail | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<string>('pending');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [formData, setFormData] = useState({
    price: '',
    deliveryTime: '',
    details: '',
    validUntil: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/requests/${id}`).then((res) => (res.ok ? res.json() : Promise.reject(new Error('Não encontrado')))),
      fetch('/api/company').then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([opp, comp]) => {
        setOpportunity(opp);
        setVerificationStatus((comp as { verificationStatus?: string })?.verificationStatus ?? 'pending');
      })
      .catch(() => setError('Oportunidade não encontrada.'))
      .finally(() => setLoading(false));
  }, [id]);

  const hasProposal = !!opportunity?.myProposal;

  const handleSubmitProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const newErrors: Record<string, string> = {};
    if (!formData.price.trim()) newErrors.price = 'Preço é obrigatório';
    if (!formData.deliveryTime.trim()) newErrors.deliveryTime = 'Prazo de entrega é obrigatório';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/proposals/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: id,
          price: formData.price,
          deliveryDays: formData.deliveryTime,
          details: formData.details || undefined,
          validity: formData.validUntil || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrors({ price: data.error || 'Erro ao enviar proposta.' });
        setSubmitting(false);
        return;
      }
      setShowProposalModal(false);
      setFormData({ price: '', deliveryTime: '', details: '', validUntil: '' });
      setOpportunity((prev) => prev ? { ...prev, myProposal: { id: '', status: 'sent' } } : null);
      router.refresh();
    } catch {
      setErrors({ price: 'Erro ao enviar proposta. Tente novamente.' });
    }
    setSubmitting(false);
  };

  if (loading || error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header userType="seller" />
        <main className="flex-grow py-8 bg-gray-50 flex items-center justify-center">
          <Card className="max-w-md mx-auto">
            {loading ? <p className="text-gray-600">Carregando...</p> : <p className="text-gray-600">{error}</p>}
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  if (!opportunity) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Header userType="seller" />

      <main className="flex-grow py-8 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Button variant="outline" onClick={() => router.back()} className="mb-6">
            ← Voltar
          </Button>

          {verificationStatus !== 'approved' && (
            <div className="mb-6 p-4 rounded-lg text-sm bg-warning-50 border border-warning-200 text-warning-800">
              Sua empresa está em análise de CNPJ. Você não pode enviar propostas até a aprovação.
            </div>
          )}

          <Card className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">{opportunity.title}</h2>
            <div className="space-y-4 mb-6">
              <p className="text-gray-700">{opportunity.description}</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Quantidade</p>
                  <p className="font-semibold text-gray-900">{opportunity.quantity} {opportunity.unit}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Categoria</p>
                  <p className="font-semibold text-gray-900">{opportunity.category}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Prazo Desejado</p>
                  <p className="font-semibold text-gray-900">{opportunity.deliveryDate}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Comprador</p>
                  <p className="font-semibold text-gray-900">{opportunity.buyer.name}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>{opportunity.address}, {opportunity.city} - {opportunity.state}</span>
              </div>
            </div>

            {hasProposal ? (
              <div className="bg-success-50 border border-success-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 text-success-800 mb-2">
                  <Check className="w-5 h-5" />
                  <span className="font-semibold">Proposta Enviada</span>
                </div>
                <p className="text-sm text-success-700">Sua proposta foi enviada. O comprador será notificado.</p>
              </div>
            ) : verificationStatus === 'approved' ? (
              <Button onClick={() => setShowProposalModal(true)}>
                <Send className="w-5 h-5 mr-2 inline" />
                Enviar Proposta
              </Button>
            ) : (
              <Button disabled title="Aguarde a aprovação do CNPJ para enviar propostas">
                <Send className="w-5 h-5 mr-2 inline" />
                Enviar Proposta
              </Button>
            )}
          </Card>
        </div>
      </main>

      <Modal
        isOpen={showProposalModal}
        onClose={() => { setShowProposalModal(false); setErrors({}); }}
        title="Enviar Proposta"
        size="lg"
      >
        <form onSubmit={handleSubmitProposal} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preço (R$) <span className="text-danger-500">*</span></label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="number"
                  step="0.01"
                  placeholder="450.00"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  error={errors.price}
                  className="pl-10"
                />
              </div>
            </div>
            <Input
              label="Prazo de Entrega (dias)"
              type="number"
              placeholder="5"
              value={formData.deliveryTime}
              onChange={(e) => setFormData({ ...formData, deliveryTime: e.target.value })}
              error={errors.deliveryTime}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Detalhes e Condições</label>
            <textarea
              className="input min-h-[120px] resize-none"
              placeholder="Condições de entrega, garantia, etc."
              value={formData.details}
              onChange={(e) => setFormData({ ...formData, details: e.target.value })}
            />
          </div>
          <Input
            label="Validade da Proposta"
            type="date"
            value={formData.validUntil}
            onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
          />
          <div className="flex space-x-4 pt-4">
            <Button type="button" variant="outline" onClick={() => setShowProposalModal(false)} className="flex-1">Cancelar</Button>
            <Button type="submit" className="flex-1" isLoading={submitting}>
              <Send className="w-4 h-4 mr-1 inline" />
              Enviar Proposta
            </Button>
          </div>
        </form>
      </Modal>

      <Footer />
    </div>
  );
}
