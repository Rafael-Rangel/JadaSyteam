'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Modal from '@/components/Modal';
import { Package, MapPin, Calendar, DollarSign, Send, Edit, Check } from 'lucide-react';

export default function OpportunityDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [formData, setFormData] = useState({
    price: '',
    deliveryTime: '',
    details: '',
    validUntil: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasProposal, setHasProposal] = useState(false);

  // Dados simulados
  const opportunity = {
    id: params.id,
    title: '600 parafusos M6',
    description: 'Preciso de 600 parafusos M6 de aço inoxidável para projeto de construção. Entrega preferencialmente na região de São Paulo.',
    quantity: 600,
    unit: 'pcs',
    category: 'Construção',
    deliveryDate: '2024-02-15',
    address: 'Rua das Flores, 123, Centro',
    city: 'São Paulo',
    state: 'SP',
    buyer: 'Empresa ABC',
    created: '2024-01-15',
  };

  const handleSubmitProposal = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const newErrors: Record<string, string> = {};
    if (!formData.price) newErrors.price = 'Preço é obrigatório';
    if (!formData.deliveryTime) newErrors.deliveryTime = 'Prazo de entrega é obrigatório';
    if (!formData.details.trim()) newErrors.details = 'Detalhes são obrigatórios';
    if (!formData.validUntil) newErrors.validUntil = 'Validade da proposta é obrigatória';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Simular envio (sem backend)
    setHasProposal(true);
    setShowProposalModal(false);
    setFormData({ price: '', deliveryTime: '', details: '', validUntil: '' });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header userType="seller" userName="Maria Santos" />
      
      <main className="flex-grow py-8 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Button variant="outline" onClick={() => router.back()} className="mb-6">
            ← Voltar
          </Button>

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
                  <p className="font-semibold text-gray-900">
                    {new Date(opportunity.deliveryDate).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Comprador</p>
                  <p className="font-semibold text-gray-900">{opportunity.buyer}</p>
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
                <p className="text-sm text-success-700">
                  Sua proposta foi enviada com sucesso. O comprador será notificado.
                </p>
              </div>
            ) : (
              <Button onClick={() => setShowProposalModal(true)}>
                <Send className="w-5 h-5 mr-2 inline" />
                Enviar Proposta
              </Button>
            )}
          </Card>
        </div>
      </main>

      {/* Proposal Modal */}
      <Modal
        isOpen={showProposalModal}
        onClose={() => {
          setShowProposalModal(false);
          setFormData({ price: '', deliveryTime: '', details: '', validUntil: '' });
          setErrors({});
        }}
        title="Enviar Proposta"
        size="lg"
      >
        <form onSubmit={handleSubmitProposal} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preço (R$) <span className="text-danger-500">*</span>
              </label>
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
                  required
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
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Detalhes e Condições <span className="text-danger-500">*</span>
            </label>
            <textarea
              className="input min-h-[120px] resize-none"
              placeholder="Descreva as condições de entrega, garantia, formas de pagamento, etc..."
              value={formData.details}
              onChange={(e) => setFormData({ ...formData, details: e.target.value })}
              required
            />
            {errors.details && (
              <p className="mt-1 text-sm text-danger-600">{errors.details}</p>
            )}
          </div>

          <Input
            label="Validade da Proposta"
            type="date"
            value={formData.validUntil}
            onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
            error={errors.validUntil}
            icon={<Calendar className="w-5 h-5" />}
            required
          />

          <div className="flex space-x-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowProposalModal(false);
                setFormData({ price: '', deliveryTime: '', details: '', validUntil: '' });
                setErrors({});
              }}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button type="submit" className="flex-1">
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



