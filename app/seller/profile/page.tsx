'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Input from '@/components/Input';
import { Building, User, Mail, Phone, MapPin, Save } from 'lucide-react';

export default function SellerProfilePage() {
  const [formData, setFormData] = useState({
    companyName: 'Fornecedor XYZ',
    cnpj: '98.765.432/0001-10',
    address: 'Av. Principal, 456',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '01234-567',
    ownerName: 'Maria Santos',
    email: 'maria@fornecedor.com',
    phone: '(11) 88888-8888',
    description: 'Fornecedor especializado em materiais de construção',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      alert('Perfil atualizado com sucesso!');
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header userType="seller" userName="Maria Santos" />
      
      <main className="flex-grow py-8 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Perfil da Empresa</h1>

          <form onSubmit={handleSubmit}>
            <Card className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Informações da Empresa</h2>
              <div className="space-y-4">
                <Input
                  label="Nome da Empresa"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  icon={<Building className="w-5 h-5" />}
                  required
                />

                <Input
                  label="CNPJ"
                  value={formData.cnpj}
                  onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição
                  </label>
                  <textarea
                    className="input min-h-[100px] resize-none"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </div>
            </Card>

            <Card className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Endereço</h2>
              <div className="space-y-4">
                <Input
                  label="Endereço"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  icon={<MapPin className="w-5 h-5" />}
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Cidade"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />

                  <Input
                    label="Estado"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  />
                </div>

                <Input
                  label="CEP"
                  value={formData.zipCode}
                  onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                />
              </div>
            </Card>

            <Card className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Dados do Responsável</h2>
              <div className="space-y-4">
                <Input
                  label="Nome Completo"
                  value={formData.ownerName}
                  onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                  icon={<User className="w-5 h-5" />}
                  required
                />

                <Input
                  label="E-mail"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  icon={<Mail className="w-5 h-5" />}
                  required
                />

                <Input
                  label="Telefone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  icon={<Phone className="w-5 h-5" />}
                />
              </div>
            </Card>

            <div className="flex justify-end">
              <Button type="submit" isLoading={isLoading}>
                <Save className="w-5 h-5 mr-2 inline" />
                Salvar Alterações
              </Button>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}



