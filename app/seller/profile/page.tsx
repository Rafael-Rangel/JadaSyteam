'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Input from '@/components/Input';
import { Building, User, Mail, Phone, MapPin, Save } from 'lucide-react';

type CompanyData = {
  name: string;
  cnpj: string;
  verificationStatus?: string;
  verifiedAt?: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  description: string | null;
  ownerName: string | null;
  ownerEmail: string | null;
  ownerPhone: string | null;
};

export default function SellerProfilePage() {
  const [formData, setFormData] = useState({
    companyName: '',
    cnpj: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    description: '',
    ownerName: '',
    email: '',
    phone: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<string>('pending');

  useEffect(() => {
    fetch('/api/company')
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('Erro ao carregar'))))
      .then((data: CompanyData) => {
        setFormData({
          companyName: data.name ?? '',
          cnpj: data.cnpj ?? '',
          address: data.address ?? '',
          city: data.city ?? '',
          state: data.state ?? '',
          zipCode: data.zipCode ?? '',
          description: data.description ?? '',
          ownerName: data.ownerName ?? '',
          email: data.ownerEmail ?? '',
          phone: data.ownerPhone ?? '',
        });
        setVerificationStatus(data.verificationStatus ?? 'pending');
      })
      .catch(() => setError('Não foi possível carregar o perfil.'))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/company', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.companyName,
          cnpj: formData.cnpj.trim() || undefined,
          address: formData.address || undefined,
          city: formData.city || undefined,
          state: formData.state || undefined,
          zipCode: formData.zipCode || undefined,
          description: formData.description || undefined,
          ownerName: formData.ownerName || undefined,
          ownerPhone: formData.phone || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Erro ao salvar.');
        setSaving(false);
        return;
      }
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      setSaving(false);
    } catch {
      setError('Erro ao salvar. Tente novamente.');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header userType="seller" />
        <main className="flex-grow py-8 bg-gray-50 flex items-center justify-center">
          <p className="text-gray-600">Carregando perfil...</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header userType="seller" />

      <main className="flex-grow py-8 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Perfil da Empresa</h1>

          {error && (
            <div className="mb-6 p-4 bg-danger-50 border border-danger-200 rounded-lg text-danger-800 text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-6 p-4 bg-success-50 border border-success-200 rounded-lg text-success-800 text-sm">
              Perfil atualizado com sucesso!
            </div>
          )}

          {verificationStatus && verificationStatus !== 'approved' && (
            <div className={`mb-6 p-4 rounded-lg text-sm ${verificationStatus === 'rejected' ? 'bg-danger-50 border border-danger-200 text-danger-800' : 'bg-warning-50 border border-warning-200 text-warning-800'}`}>
              {verificationStatus === 'pending' && 'Sua empresa está em análise de CNPJ. Você não pode enviar propostas até a aprovação.'}
              {verificationStatus === 'rejected' && 'CNPJ não aprovado. Verifique o número ou entre em contato. Você não pode enviar propostas até a aprovação.'}
            </div>
          )}

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
                  placeholder="00.000.000/0000-00"
                  value={formData.cnpj}
                  onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                  required
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
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
                  icon={<Mail className="w-5 h-5" />}
                  disabled
                  title="E-mail não pode ser alterado aqui"
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
              <Button type="submit" isLoading={saving}>
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
