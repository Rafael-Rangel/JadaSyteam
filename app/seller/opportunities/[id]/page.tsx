'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Modal from '@/components/Modal';
import PageHeader from '@/components/ui/PageHeader';
import { MapPin, DollarSign, Send, Check } from 'lucide-react';

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

export default function OpportunityDetailPage() {
  const params = useParams();
  const id = params?.id as string;
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
    if (!id) return;
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
      setOpportunity((prev) => (prev ? { ...prev, myProposal: { id: '', status: 'sent' } } : null));
      router.refresh();
    } catch {
      setErrors({ price: 'Erro ao enviar proposta. Tente novamente.' });
    }
    setSubmitting(false);
  };

  if (loading || error) {
    return (
      <div>
        <PageHeader title="Oportunidade" description={loading ? 'Carregando…' : error || ''} />
        <Card>
          {loading ? <p className="text-neutral-600">Carregando…</p> : <p className="text-neutral-600">{error}</p>}
        </Card>
      </div>
    );
  }

  if (!opportunity) return null;

  return (
    <div>
      <div className="mb-6">
        <Button variant="outline" onClick={() => router.back()}>
          ← Voltar
        </Button>
      </div>

      <PageHeader title={opportunity.title} description="Detalhes da requisição e envio de proposta." />

      {verificationStatus !== 'approved' && (
        <div className="mb-6 rounded-lg border border-warning-200 bg-warning-50 p-4 text-sm text-warning-800">
          Sua empresa está em análise de CNPJ. Você não pode enviar propostas até a aprovação.
        </div>
      )}

      <Card>
        <div className="mb-6 space-y-4">
          <p className="text-neutral-700">{opportunity.description}</p>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div>
              <p className="mb-1 text-sm text-neutral-600">Quantidade</p>
              <p className="font-semibold text-neutral-900">
                {opportunity.quantity} {opportunity.unit}
              </p>
            </div>
            <div>
              <p className="mb-1 text-sm text-neutral-600">Categoria</p>
              <p className="font-semibold text-neutral-900">{opportunity.category}</p>
            </div>
            <div>
              <p className="mb-1 text-sm text-neutral-600">Prazo desejado</p>
              <p className="font-semibold text-neutral-900">{opportunity.deliveryDate}</p>
            </div>
            <div>
              <p className="mb-1 text-sm text-neutral-600">Comprador</p>
              <p className="font-semibold text-neutral-900">{opportunity.buyer.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-neutral-600">
            <MapPin className="h-4 w-4 shrink-0" />
            <span>
              {opportunity.address}, {opportunity.city} - {opportunity.state}
            </span>
          </div>
        </div>

        {hasProposal ? (
          <div className="rounded-lg border border-success-200 bg-success-50 p-4">
            <div className="mb-2 flex items-center gap-2 text-success-800">
              <Check className="h-5 w-5" />
              <span className="font-semibold">Proposta enviada</span>
            </div>
            <p className="text-sm text-success-700">Sua proposta foi enviada. O comprador será notificado.</p>
          </div>
        ) : verificationStatus === 'approved' ? (
          <Button onClick={() => setShowProposalModal(true)}>
            <Send className="mr-2 inline h-5 w-5" />
            Enviar proposta
          </Button>
        ) : (
          <Button disabled title="Aguarde a aprovação do CNPJ para enviar propostas">
            <Send className="mr-2 inline h-5 w-5" />
            Enviar proposta
          </Button>
        )}
      </Card>

      <Modal
        isOpen={showProposalModal}
        onClose={() => {
          setShowProposalModal(false);
          setErrors({});
        }}
        title="Enviar proposta"
        size="lg"
      >
        <form onSubmit={handleSubmitProposal} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">
                Preço (R$) <span className="text-danger-500">*</span>
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-neutral-400" />
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
              label="Prazo de entrega (dias)"
              type="number"
              placeholder="5"
              value={formData.deliveryTime}
              onChange={(e) => setFormData({ ...formData, deliveryTime: e.target.value })}
              error={errors.deliveryTime}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">Detalhes e condições</label>
            <textarea
              className="input min-h-[120px] resize-none"
              placeholder="Condições de entrega, garantia, etc."
              value={formData.details}
              onChange={(e) => setFormData({ ...formData, details: e.target.value })}
            />
          </div>
          <Input
            label="Validade da proposta"
            type="date"
            value={formData.validUntil}
            onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
          />
          <div className="flex gap-4 pt-4">
            <Button type="button" variant="outline" onClick={() => setShowProposalModal(false)} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" isLoading={submitting}>
              <Send className="mr-1 inline h-4 w-4" />
              Enviar
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
