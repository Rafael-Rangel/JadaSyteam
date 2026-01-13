'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Modal from '@/components/Modal';
import { Package, MapPin, Calendar, DollarSign, Check, X, MessageCircle, Phone, Mail } from 'lucide-react';

export default function RequestDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<number | null>(null);

  // Dados simulados
  const request = {
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
    status: 'receiving',
    created: '2024-01-15',
    proposals: [
      {
        id: 1,
        sellerName: 'Fornecedor ABC',
        price: 450.00,
        deliveryTime: 5,
        details: 'Entrega em 5 dias úteis, frete incluso. Garantia de qualidade.',
        rating: 4.5,
        distance: '12 km',
        status: 'sent',
      },
      {
        id: 2,
        sellerName: 'Materiais XYZ',
        price: 420.00,
        deliveryTime: 7,
        details: 'Melhor preço do mercado. Entrega em até 7 dias úteis.',
        rating: 4.8,
        distance: '8 km',
        status: 'sent',
      },
      {
        id: 3,
        sellerName: 'Construção Total',
        price: 480.00,
        deliveryTime: 3,
        details: 'Entrega rápida em 3 dias. Produto de alta qualidade.',
        rating: 4.2,
        distance: '15 km',
        status: 'sent',
      },
    ],
  };

  const handleAcceptProposal = (proposalId: number) => {
    setSelectedProposal(proposalId);
    setShowAcceptModal(true);
  };

  const confirmAccept = () => {
    // Simular aceite (sem backend)
    setShowAcceptModal(false);
    router.push('/buyer/requests');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header userType="buyer" userName="João Silva" />
      
      <main className="flex-grow py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Button variant="outline" onClick={() => router.back()} className="mb-6">
            ← Voltar
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Request Details */}
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
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-600">
                        <strong>Categoria:</strong> {request.category}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">
                        <strong>Prazo:</strong> {new Date(request.deliveryDate).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">
                        {request.address}, {request.city} - {request.state}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <span className="badge badge-warning">Recebendo Propostas</span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Proposals */}
            <div className="lg:col-span-2">
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Propostas Recebidas ({request.proposals.length})
                </h2>
                <p className="text-gray-600 text-sm">Compare e escolha a melhor proposta</p>
              </div>

              <div className="space-y-4">
                {request.proposals.map((proposal) => (
                  <Card key={proposal.id}>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {proposal.sellerName}
                        </h3>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <span>⭐ {proposal.rating}</span>
                          <span>•</span>
                          <span>{proposal.distance} de distância</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary-600 mb-1">
                          R$ {proposal.price.toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-600">
                          {proposal.deliveryTime} dias úteis
                        </div>
                      </div>
                    </div>

                    <p className="text-gray-700 mb-4">{proposal.details}</p>

                    <div className="flex items-center space-x-2">
                      <Button
                        variant="success"
                        onClick={() => handleAcceptProposal(proposal.id)}
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Aceitar Proposta
                      </Button>
                      <Button variant="outline">
                        <X className="w-4 h-4 mr-1" />
                        Recusar
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Accept Proposal Modal */}
      <Modal
        isOpen={showAcceptModal}
        onClose={() => setShowAcceptModal(false)}
        title="Confirmar Aceite da Proposta"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Ao aceitar esta proposta, o contato do vendedor será liberado e você poderá finalizar o negócio.
          </p>

          {selectedProposal && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Contato do Vendedor</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <a href="tel:+5511999999999" className="text-primary-600 hover:text-primary-700">
                    (11) 99999-9999
                  </a>
                </div>
                <div className="flex items-center space-x-2">
                  <MessageCircle className="w-4 h-4 text-gray-400" />
                  <a
                    href="https://wa.me/5511999999999"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-success-600 hover:text-success-700"
                  >
                    WhatsApp
                  </a>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <a href="mailto:vendedor@empresa.com" className="text-primary-600 hover:text-primary-700">
                    vendedor@empresa.com
                  </a>
                </div>
              </div>
            </div>
          )}

          <div className="flex space-x-4 pt-4">
            <Button variant="outline" onClick={() => setShowAcceptModal(false)} className="flex-1">
              Cancelar
            </Button>
            <Button variant="success" onClick={confirmAccept} className="flex-1">
              Confirmar Aceite
            </Button>
          </div>
        </div>
      </Modal>

      <Footer />
    </div>
  );
}



