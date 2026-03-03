'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Input from '@/components/Input';
import { Search, Eye, MapPin, Calendar, Package, SlidersHorizontal, X } from 'lucide-react';

type OpportunityItem = {
  id: string;
  title: string;
  description?: string;
  buyer: string;
  buyerId: string;
  category: string;
  city: string;
  state: string;
  deliveryDate: string;
  created: string;
  hasProposal: boolean;
};

export default function OpportunitiesPage() {
  const [showFilters, setShowFilters] = useState(false);
  const [opportunities, setOpportunities] = useState<OpportunityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    searchTerm: '',
    keyword: '',
    productKeyword: '',
    category: 'all',
    company: 'all',
    radius: '',
    city: '',
    state: '',
  });

  useEffect(() => {
    fetch('/api/requests')
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('Erro ao carregar'))))
      .then(setOpportunities)
      .catch(() => setError('Não foi possível carregar as oportunidades.'))
      .finally(() => setLoading(false));
  }, []);

  const categories = ['Construção', 'Elétrica', 'Hidráulica', 'Ferramentas', 'Materiais', 'Outros'];
  const companies = Array.from(new Set(opportunities.map((o) => o.buyer))).sort();

  const filteredOpportunities = opportunities.filter((opp) => {
    const desc = (opp.description || '').toLowerCase();
    const matchesSearch = !filters.searchTerm ||
      opp.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      desc.includes(filters.searchTerm.toLowerCase()) ||
      opp.buyer.toLowerCase().includes(filters.searchTerm.toLowerCase());
    const matchesKeyword = !filters.keyword ||
      opp.title.toLowerCase().includes(filters.keyword.toLowerCase()) || desc.includes(filters.keyword.toLowerCase());
    const matchesProductKeyword = !filters.productKeyword ||
      opp.title.toLowerCase().includes(filters.productKeyword.toLowerCase());
    const matchesCategory = filters.category === 'all' || opp.category === filters.category;
    const matchesCompany = filters.company === 'all' || opp.buyer === filters.company;
    const matchesCity = !filters.city || opp.city.toLowerCase().includes(filters.city.toLowerCase());
    const matchesState = !filters.state || opp.state === filters.state;
    return matchesSearch && matchesKeyword && matchesProductKeyword &&
      matchesCategory && matchesCompany && matchesCity && matchesState;
  });

  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      keyword: '',
      productKeyword: '',
      category: 'all',
      company: 'all',
      radius: '',
      city: '',
      state: '',
    });
  };

  const hasActiveFilters = filters.searchTerm || filters.keyword || filters.productKeyword ||
    filters.category !== 'all' || filters.company !== 'all' || filters.radius ||
    filters.city || filters.state;

  return (
    <div className="min-h-screen flex flex-col">
      <Header userType="seller" />
      
      <main className="flex-grow py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Oportunidades</h1>
            <p className="text-gray-600 mt-1">Encontre novas oportunidades de negócio</p>
          </div>

          {/* Search Bar */}
          <Card className="mb-4">
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Buscar por título, descrição ou comprador..."
                  value={filters.searchTerm}
                  onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
                  className="pl-10"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className={hasActiveFilters ? 'border-primary-600 text-primary-600' : ''}
              >
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Filtros
                {hasActiveFilters && (
                  <span className="ml-2 bg-primary-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                    {Object.values(filters).filter(v => v && v !== 'all').length}
                  </span>
                )}
              </Button>
            </div>
          </Card>

          {/* Advanced Filters */}
          {showFilters && (
            <Card className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Filtros Avançados</h3>
                {hasActiveFilters && (
                  <Button variant="outline" size="sm" onClick={clearFilters}>
                    <X className="w-4 h-4 mr-1" />
                    Limpar Filtros
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Palavra Chave */}
                <Input
                  label="Palavra Chave"
                  placeholder="Ex: parafuso, cabo, madeira..."
                  value={filters.keyword}
                  onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
                />

                {/* Produto Chave */}
                <Input
                  label="Produto Específico"
                  placeholder="Nome exato do produto..."
                  value={filters.productKeyword}
                  onChange={(e) => setFilters({ ...filters, productKeyword: e.target.value })}
                />

                {/* Categoria */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categoria
                  </label>
                  <select
                    className="input"
                    value={filters.category}
                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  >
                    <option value="all">Todas as categorias</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Empresa Específica */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Empresa Específica
                  </label>
                  <select
                    className="input"
                    value={filters.company}
                    onChange={(e) => setFilters({ ...filters, company: e.target.value })}
                  >
                    <option value="all">Todas as empresas</option>
                    {companies.map((comp) => (
                      <option key={comp} value={comp}>{comp}</option>
                    ))}
                  </select>
                </div>

                {/* Raio de Distância */}
                <Input
                  label="Raio Máximo (km)"
                  type="number"
                  placeholder="Ex: 20"
                  value={filters.radius}
                  onChange={(e) => setFilters({ ...filters, radius: e.target.value })}
                  helperText="Mostrar apenas requisições dentro deste raio"
                />

                {/* Cidade */}
                <Input
                  label="Cidade"
                  placeholder="Ex: São Paulo"
                  value={filters.city}
                  onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                />

                {/* Estado */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estado
                  </label>
                  <select
                    className="input"
                    value={filters.state}
                    onChange={(e) => setFilters({ ...filters, state: e.target.value })}
                  >
                    <option value="">Todos os estados</option>
                    <option value="SP">São Paulo</option>
                    <option value="RJ">Rio de Janeiro</option>
                    <option value="MG">Minas Gerais</option>
                    <option value="RS">Rio Grande do Sul</option>
                    <option value="PR">Paraná</option>
                  </select>
                </div>
              </div>
            </Card>
          )}

          {/* Results Count */}
          <div className="mb-4 text-sm text-gray-600">
            <p>
              Mostrando <strong>{filteredOpportunities.length}</strong> de <strong>{opportunities.length}</strong> oportunidades
            </p>
          </div>

          {/* Opportunities List */}
          <div className="space-y-4">
            {loading ? (
              <Card className="text-center py-12">
                <p className="text-gray-600">Carregando...</p>
              </Card>
            ) : error ? (
              <Card className="text-center py-12">
                <p className="text-gray-600">{error}</p>
              </Card>
            ) : filteredOpportunities.length === 0 ? (
              <Card className="text-center py-12">
                <p className="text-gray-600 mb-4">Nenhuma oportunidade encontrada com os filtros aplicados</p>
                {hasActiveFilters && (
                  <Button variant="outline" onClick={clearFilters}>
                    Limpar Filtros
                  </Button>
                )}
              </Card>
            ) : (
              filteredOpportunities.map((opportunity) => (
                <Card key={opportunity.id} hover>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{opportunity.title}</h3>
                        {opportunity.hasProposal && (
                          <span className="badge badge-success">Proposta Enviada</span>
                        )}
                      </div>
                      <div className="flex items-center space-x-6 text-sm text-gray-600 flex-wrap gap-2">
                        <span className="flex items-center space-x-1">
                          <Package className="w-4 h-4" />
                          <span className="font-medium">{opportunity.buyer}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4" />
                          <span>{opportunity.city} - {opportunity.state}</span>
                        </span>
                        <span className="badge badge-info">{opportunity.category}</span>
                        <span className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>Entrega: {new Date(opportunity.deliveryDate).toLocaleDateString('pt-BR')}</span>
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-2">{opportunity.description}</p>
                    </div>
                    <Link href={`/seller/opportunities/${opportunity.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-1" />
                        Ver Detalhes
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

