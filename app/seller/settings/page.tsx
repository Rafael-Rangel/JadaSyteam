'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Card from '@/components/Card';
import Button from '@/components/Button';
import { MapPin, Package, Users, Save } from 'lucide-react';

type CompanyData = {
  sellerRadius?: number;
  sellerReceiveAll?: boolean;
  sellerCategories?: string[];
};

export default function SettingsPage() {
  const [formData, setFormData] = useState({
    radius: 20,
    receiveAll: false,
    categories: [] as string[],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const allCategories = ['Construção', 'Elétrica', 'Hidráulica', 'Ferramentas', 'Materiais', 'Outros'];

  useEffect(() => {
    fetch('/api/company')
      .then((res) => (res.ok ? res.json() : null))
      .then((data: CompanyData | null) => {
        if (data) {
          setFormData({
            radius: data.sellerRadius ?? 20,
            receiveAll: data.sellerReceiveAll ?? false,
            categories: Array.isArray(data.sellerCategories) ? data.sellerCategories : [],
          });
        }
      })
      .catch(() => setError('Não foi possível carregar as configurações.'))
      .finally(() => setLoading(false));
  }, []);

  const handleCategoryToggle = (category: string) => {
    if (formData.categories.includes(category)) {
      setFormData({
        ...formData,
        categories: formData.categories.filter((c) => c !== category),
      });
    } else {
      setFormData({
        ...formData,
        categories: [...formData.categories, category],
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/company', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sellerRadius: formData.radius,
          sellerReceiveAll: formData.receiveAll,
          sellerCategories: formData.categories,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Erro ao salvar configurações.');
        setSaving(false);
        return;
      }
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError('Erro ao salvar. Tente novamente.');
    }
    setSaving(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header userType="seller" />

      <main className="flex-grow py-8 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Configurações</h1>

          {error && (
            <div className="mb-6 p-4 bg-danger-50 border border-danger-200 rounded-lg text-danger-800 text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-6 p-4 bg-success-50 border border-success-200 rounded-lg text-success-800 text-sm">
              Configurações salvas com sucesso!
            </div>
          )}

          {loading ? (
            <p className="text-gray-600">Carregando configurações...</p>
          ) : (
            <form onSubmit={handleSubmit}>
              <Card className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center space-x-2">
                  <MapPin className="w-5 h-5" />
                  <span>Raio de Oportunidades</span>
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Raio padrão (km): {formData.radius} km
                    </label>
                    <input
                      type="range"
                      min="5"
                      max="100"
                      value={formData.radius}
                      onChange={(e) =>
                        setFormData({ ...formData, radius: parseInt(e.target.value) })
                      }
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>5 km</span>
                      <span>100 km</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="receiveAll"
                      checked={formData.receiveAll}
                      onChange={(e) =>
                        setFormData({ ...formData, receiveAll: e.target.checked })
                      }
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <label htmlFor="receiveAll" className="text-sm text-gray-700">
                      Receber todas as oportunidades (ignorar raio)
                    </label>
                  </div>
                </div>
              </Card>

              <Card className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center space-x-2">
                  <Package className="w-5 h-5" />
                  <span>Categorias de Interesse</span>
                </h2>
                <div className="space-y-2">
                  {allCategories.map((category) => (
                    <label
                      key={category}
                      className="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={formData.categories.includes(category)}
                        onChange={() => handleCategoryToggle(category)}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-gray-700">{category}</span>
                    </label>
                  ))}
                </div>
              </Card>

              <Card className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>Compradores Seguidos</span>
                </h2>
                <p className="text-sm text-gray-600">
                  Em breve você poderá seguir compradores e receber todas as requisições deles.
                </p>
              </Card>

              <div className="flex justify-end">
                <Button type="submit" isLoading={saving}>
                  <Save className="w-5 h-5 mr-2 inline" />
                  Salvar Configurações
                </Button>
              </div>
            </form>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
