'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Input from '@/components/Input';
import { Search, Filter, Eye, MapPin, Calendar, Package, X, SlidersHorizontal } from 'lucide-react';

export default function OpportunitiesPage() {
  const [showFilters, setShowFilters] = useState(false);
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

  const opportunities = [
    {
      id: 1,
      title: '600 parafusos M6',
      buyer: 'Empresa ABC',
      buyerId: 'abc',
      distance: 12,
      category: 'Construção',
      city: 'São Paulo',
      state: 'SP',
      deliveryDate: '2024-02-15',
      created: '2024-01-15',
      hasProposal: false,
      description: 'Parafusos de aço inoxidável para construção',
    },
    {
      id: 2,
      title: '100 metros de cabo elétrico',
      buyer: 'Empresa XYZ',
      buyerId: 'xyz',
      distance: 8,
      category: 'Elétrica',
      city: 'São Paulo',
      state: 'SP',
      deliveryDate: '2024-02-20',
      created: '2024-01-14',
      hasProposal: true,
      description: 'Cabo elétrico flexível 2.5mm',
    },
    {
      id: 3,
      title: '50 placas de madeira',
      buyer: 'Construção Total',
      buyerId: 'total',
      distance: 15,
      category: 'Construção',
      city: 'São Paulo',
      state: 'SP',
      deliveryDate: '2024-02-18',
      created: '2024-01-13',
      hasProposal: false,
      description: 'Placas de madeira compensada',
    },
    {
      id: 4,
      title: '200 tijolos cerâmicos',
      buyer: 'Empresa ABC',
      buyerId: 'abc',
      distance: 25,
      category: 'Construção',
      city: 'Guarulhos',
      state: 'SP',
      deliveryDate: '2024-02-25',
      created: '2024-01-12',
      hasProposal: false,
      description: 'Tijolos cerâmicos padrão',
    },
    {
      id: 5,
      title: '30 torneiras elétricas',
      buyer: 'Hidráulica Plus',
      buyerId: 'hidraulica',
      distance: 18,
      category: 'Hidráulica',
      city: 'São Paulo',
      state: 'SP',
      deliveryDate: '2024-02-22',
      created: '2024-01-11',
      hasProposal: false,
      description: 'Torneiras elétricas para banheiro',
    },
  ];

  const companies = ['Empresa ABC', 'Empresa XYZ', 'Construção Total', 'Hidráulica Plus'];
  const categories = ['Construção', 'Elétrica', 'Hidráulica', 'Ferramentas', 'Materiais'];

  const filteredOpportunities = opportunities.filter((opp) => {
    // Busca geral (título, descrição, comprador)
    const matchesSearch = !filters.searchTerm || 
      opp.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      opp.description.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      opp.buyer.toLowerCase().includes(filters.searchTerm.toLowerCase());

    // Palavra chave
    const matchesKeyword = !filters.keyword ||
      opp.title.toLowerCase().includes(filters.keyword.toLowerCase()) ||
      opp.description.toLowerCase().includes(filters.keyword.toLowerCase());

    // Produto chave
    const matchesProductKeyword = !filters.productKeyword ||
      opp.title.toLowerCase().includes(filters.productKeyword.toLowerCase());

    // Categoria
    const matchesCategory = filters.category === 'all' || opp.category === filters.category;

    // Empresa específica
    const matchesCompany = filters.company === 'all' || opp.buyer === filters.company;

    // Raio de distância
    const matchesRadius = !filters.radius || opp.distance <= parseInt(filters.radius);

    // Cidade
    const matchesCity = !filters.city || 
      opp.city.toLowerCase().includes(filters.city.toLowerCase());

    // Estado
    const matchesState = !filters.state || opp.state === filters.state;

    return matchesSearch && matchesKeyword && matchesProductKeyword && 
           matchesCategory && matchesCompany && matchesRadius && 
           matchesCity && matchesState;
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
      <Header userType="seller" userName="Maria Santos" />
      
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
            {filteredOpportunities.length === 0 ? (
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
                          <span>{opportunity.distance} km • {opportunity.city} - {opportunity.state}</span>
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

