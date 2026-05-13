'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/Card';
import Button from '@/components/Button';
import PageHeader from '@/components/ui/PageHeader';
import Skeleton from '@/components/ui/Skeleton';
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

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton height={36} width="35%" />
        <Skeleton height={180} />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Configurações" description="Preferências de oportunidades e categorias." />

      {error && (
        <div className="mb-6 rounded-lg border border-danger-200 bg-danger-50 p-4 text-sm text-danger-800">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-6 rounded-lg border border-success-200 bg-success-50 p-4 text-sm text-success-800">
          Configurações salvas com sucesso!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <h2 className="mb-6 flex items-center gap-2 text-lg font-semibold text-neutral-900">
            <MapPin className="h-5 w-5" />
            <span>Raio de oportunidades</span>
          </h2>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-700">
                Raio padrão (km): {formData.radius} km
              </label>
              <input
                type="range"
                min={5}
                max={100}
                value={formData.radius}
                onChange={(e) => setFormData({ ...formData, radius: parseInt(e.target.value, 10) })}
                className="w-full accent-primary-600"
              />
              <div className="mt-1 flex justify-between text-xs text-neutral-500">
                <span>5 km</span>
                <span>100 km</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="receiveAll"
                checked={formData.receiveAll}
                onChange={(e) => setFormData({ ...formData, receiveAll: e.target.checked })}
                className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
              />
              <label htmlFor="receiveAll" className="text-sm text-neutral-700">
                Receber todas as oportunidades (ignorar raio)
              </label>
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="mb-6 flex items-center gap-2 text-lg font-semibold text-neutral-900">
            <Package className="h-5 w-5" />
            <span>Categorias de interesse</span>
          </h2>
          <div className="space-y-2">
            {allCategories.map((category) => (
              <label
                key={category}
                className="flex cursor-pointer items-center gap-2 rounded-lg border border-neutral-200 p-3 hover:bg-neutral-50"
              >
                <input
                  type="checkbox"
                  checked={formData.categories.includes(category)}
                  onChange={() => handleCategoryToggle(category)}
                  className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-neutral-700">{category}</span>
              </label>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-neutral-900">
            <Users className="h-5 w-5" />
            <span>Compradores seguidos</span>
          </h2>
          <p className="text-sm text-neutral-600">
            Em breve você poderá seguir compradores e receber todas as requisições deles.
          </p>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" isLoading={saving}>
            <Save className="mr-2 inline h-5 w-5" />
            Salvar configurações
          </Button>
        </div>
      </form>
    </div>
  );
}
