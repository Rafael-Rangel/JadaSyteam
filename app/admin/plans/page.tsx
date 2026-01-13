'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Modal from '@/components/Modal';
import { Plus, Edit, Trash2, Check } from 'lucide-react';

export default function PlansPage() {
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);

  const plans = [
    {
      id: 1,
      name: 'Starter',
      price: 49,
      maxUsers: 3,
      maxRequests: 20,
      maxProposals: 100,
      maxCategories: 3,
      active: true,
    },
    {
      id: 2,
      name: 'Growth',
      price: 199,
      maxUsers: 10,
      maxRequests: 200,
      maxProposals: 1000,
      maxCategories: 10,
      active: true,
    },
    {
      id: 3,
      name: 'Enterprise',
      price: 799,
      maxUsers: -1, // Ilimitado
      maxRequests: -1,
      maxProposals: -1,
      maxCategories: -1,
      active: true,
    },
  ];

  const handleEdit = (plan: any) => {
    setEditingPlan(plan);
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingPlan(null);
    setShowModal(true);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header userType="admin" userName="Admin" />
      
      <main className="flex-grow py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Planos</h1>
              <p className="text-gray-600 mt-1">Gerencie os planos de assinatura</p>
            </div>
            <Button onClick={handleAdd}>
              <Plus className="w-5 h-5 mr-2 inline" />
              Novo Plano
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <Card key={plan.id}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                    <p className="text-2xl font-bold text-primary-600 mt-2">
                      R$ {plan.price}
                      <span className="text-sm text-gray-600 font-normal">/mês</span>
                    </p>
                  </div>
                  {plan.active && (
                    <span className="badge badge-success">
                      <Check className="w-3 h-3 mr-1" />
                      Ativo
                    </span>
                  )}
                </div>

                <div className="space-y-2 text-sm text-gray-600 mb-6">
                  <div className="flex justify-between">
                    <span>Usuários:</span>
                    <span className="font-semibold">{plan.maxUsers === -1 ? 'Ilimitado' : plan.maxUsers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Requisições/mês:</span>
                    <span className="font-semibold">{plan.maxRequests === -1 ? 'Ilimitado' : plan.maxRequests}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Propostas/mês:</span>
                    <span className="font-semibold">{plan.maxProposals === -1 ? 'Ilimitado' : plan.maxProposals}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Categorias:</span>
                    <span className="font-semibold">{plan.maxCategories === -1 ? 'Todas' : plan.maxCategories}</span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button variant="outline" onClick={() => handleEdit(plan)} className="flex-1">
                    <Edit className="w-4 h-4 mr-1" />
                    Editar
                  </Button>
                  <Button variant="danger" className="flex-1">
                    <Trash2 className="w-4 h-4 mr-1" />
                    Excluir
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </main>

      {/* Plan Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingPlan(null);
        }}
        title={editingPlan ? 'Editar Plano' : 'Novo Plano'}
        size="lg"
      >
        <form className="space-y-4">
          <Input
            label="Nome do Plano"
            placeholder="Starter"
            defaultValue={editingPlan?.name || ''}
            required
          />

          <Input
            label="Preço (R$)"
            type="number"
            placeholder="49"
            defaultValue={editingPlan?.price || ''}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Máx. Usuários"
              type="number"
              placeholder="3 (-1 para ilimitado)"
              defaultValue={editingPlan?.maxUsers || ''}
            />

            <Input
              label="Máx. Requisições/mês"
              type="number"
              placeholder="20 (-1 para ilimitado)"
              defaultValue={editingPlan?.maxRequests || ''}
            />

            <Input
              label="Máx. Propostas/mês"
              type="number"
              placeholder="100 (-1 para ilimitado)"
              defaultValue={editingPlan?.maxProposals || ''}
            />

            <Input
              label="Máx. Categorias"
              type="number"
              placeholder="3 (-1 para todas)"
              defaultValue={editingPlan?.maxCategories || ''}
            />
          </div>

          <div className="flex space-x-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowModal(false);
                setEditingPlan(null);
              }}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button type="submit" className="flex-1">
              {editingPlan ? 'Salvar Alterações' : 'Criar Plano'}
            </Button>
          </div>
        </form>
      </Modal>

      <Footer />
    </div>
  );
}



