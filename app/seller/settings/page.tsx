'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Input from '@/components/Input';
import { MapPin, Package, Users, Save, Check } from 'lucide-react';

export default function SettingsPage() {
  const [formData, setFormData] = useState({
    radius: 20,
    receiveAll: false,
    categories: ['Construção', 'Elétrica'],
  });
  const [isLoading, setIsLoading] = useState(false);

  const allCategories = ['Construção', 'Elétrica', 'Hidráulica', 'Ferramentas', 'Materiais', 'Outros'];

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simular salvamento (sem backend)
    setTimeout(() => {
      setIsLoading(false);
      alert('Configurações salvas com sucesso!');
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header userType="seller" userName="Maria Santos" />
      
      <main className="flex-grow py-8 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Configurações</h1>

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
                    onChange={(e) => setFormData({ ...formData, radius: parseInt(e.target.value) })}
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
                    onChange={(e) => setFormData({ ...formData, receiveAll: e.target.checked })}
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
              <div className="space-y-2">
                <p className="text-sm text-gray-600 mb-4">
                  Ao seguir um comprador, você receberá todas as requisições dele, independente do raio ou categoria.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <span className="text-gray-700">Empresa ABC</span>
                    <Button variant="danger" size="sm">
                      Deixar de Seguir
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <span className="text-gray-700">Empresa XYZ</span>
                    <Button variant="danger" size="sm">
                      Deixar de Seguir
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            <div className="flex justify-end">
              <Button type="submit" isLoading={isLoading}>
                <Save className="w-5 h-5 mr-2 inline" />
                Salvar Configurações
              </Button>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}



