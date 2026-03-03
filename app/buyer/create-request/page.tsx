'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Card from '@/components/Card';
import { Package, MapPin, Calendar, FileText, Upload } from 'lucide-react';

export default function CreateRequestPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    quantity: '',
    unit: 'pcs',
    category: '',
    deliveryDate: '',
    address: '',
    city: '',
    state: '',
    isPublic: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const categories = [
    'Construção',
    'Elétrica',
    'Hidráulica',
    'Ferramentas',
    'Materiais',
    'Outros',
  ];

  const units = ['pcs', 'kg', 'm', 'm²', 'm³', 'un'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = 'Título é obrigatório';
    if (!formData.description.trim()) newErrors.description = 'Descrição é obrigatória';
    if (!formData.quantity) newErrors.quantity = 'Quantidade é obrigatória';
    if (!formData.category) newErrors.category = 'Categoria é obrigatória';
    if (!formData.deliveryDate) newErrors.deliveryDate = 'Prazo de entrega é obrigatório';
    if (!formData.address.trim()) newErrors.address = 'Endereço é obrigatório';
    if (!formData.city.trim()) newErrors.city = 'Cidade é obrigatória';
    if (!formData.state.trim()) newErrors.state = 'Estado é obrigatório';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          quantity: formData.quantity,
          unit: formData.unit,
          category: formData.category,
          deliveryDate: formData.deliveryDate,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          isPublic: formData.isPublic,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrors({ title: data.error || 'Erro ao criar requisição.' });
        setIsLoading(false);
        return;
      }
      router.push('/buyer/requests');
      router.refresh();
    } catch {
      setErrors({ title: 'Erro ao criar requisição. Tente novamente.' });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header userType="buyer" userName="João Silva" />
      
      <main className="flex-grow py-8 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Nova Requisição</h1>
            <p className="text-gray-600">Preencha os dados da sua necessidade</p>
          </div>

          <Card>
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Título da Requisição"
                placeholder="Ex: 600 parafusos M6"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                error={errors.title}
                icon={<Package className="w-5 h-5" />}
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição <span className="text-danger-500">*</span>
                </label>
                <textarea
                  className="input min-h-[120px] resize-none"
                  placeholder="Descreva detalhadamente sua necessidade..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-danger-600">{errors.description}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Quantidade"
                  type="number"
                  placeholder="600"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  error={errors.quantity}
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unidade <span className="text-danger-500">*</span>
                  </label>
                  <select
                    className="input"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  >
                    {units.map((unit) => (
                      <option key={unit} value={unit}>
                        {unit}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoria <span className="text-danger-500">*</span>
                </label>
                <select
                  className="input"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                >
                  <option value="">Selecione uma categoria</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="mt-1 text-sm text-danger-600">{errors.category}</p>
                )}
              </div>

              <Input
                label="Prazo de Entrega Desejado"
                type="date"
                value={formData.deliveryDate}
                onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
                error={errors.deliveryDate}
                icon={<Calendar className="w-5 h-5" />}
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Endereço de Entrega <span className="text-danger-500">*</span>
                </label>
                <Input
                  placeholder="Rua, número, bairro"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  error={errors.address}
                  icon={<MapPin className="w-5 h-5" />}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Cidade"
                  placeholder="São Paulo"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  error={errors.city}
                  required
                />

                <Input
                  label="Estado"
                  placeholder="SP"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  error={errors.state}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Anexos (Opcional)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">
                    Arraste arquivos aqui ou clique para selecionar
                  </p>
                  <p className="text-xs text-gray-500">PDF, JPG, PNG (máx. 10MB)</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={formData.isPublic}
                  onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <label htmlFor="isPublic" className="text-sm text-gray-700">
                  Tornar requisição pública (visível para todos os vendedores)
                </label>
              </div>

              <div className="flex space-x-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button type="submit" isLoading={isLoading} className="flex-1">
                  Publicar Requisição
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}



