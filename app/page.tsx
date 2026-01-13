import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Button from '@/components/Button';
import { ArrowRight, Check, ShoppingCart, Package, TrendingUp, Shield, Zap, Users } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-700 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Conecte Compradores e Vendedores
                <br />
                <span className="text-primary-200">de Forma Inteligente</span>
              </h1>
              <p className="text-xl md:text-2xl text-primary-100 mb-8 max-w-3xl mx-auto">
                Publique suas necessidades e receba propostas competitivas dos melhores fornecedores do mercado.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/signup">
                  <Button size="lg" className="bg-white text-primary-700 hover:bg-primary-50">
                    Começar Agora
                    <ArrowRight className="w-5 h-5 ml-2 inline" />
                  </Button>
                </Link>
                <Link href="/plans">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary-700">
                    Ver Planos
                  </Button>
                </Link>
                <Link href="/test-users">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary-700">
                    Usuários de Teste
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Por que escolher a Jada?
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Uma plataforma completa para otimizar suas compras e vendas
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="card text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingCart className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Para Compradores</h3>
                <p className="text-gray-600">
                  Publique suas necessidades e receba múltiplas propostas competitivas dos melhores fornecedores.
                </p>
              </div>

              <div className="card text-center">
                <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="w-8 h-8 text-secondary-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Para Vendedores</h3>
                <p className="text-gray-600">
                  Receba oportunidades de negócios relevantes e envie propostas diretamente para compradores qualificados.
                </p>
              </div>

              <div className="card text-center">
                <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-success-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Economia Garantida</h3>
                <p className="text-gray-600">
                  Compare preços, prazos e condições para tomar a melhor decisão e economizar.
                </p>
              </div>

              <div className="card text-center">
                <div className="w-16 h-16 bg-warning-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-warning-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Rápido e Eficiente</h3>
                <p className="text-gray-600">
                  Processo simplificado que economiza tempo e agiliza suas negociações.
                </p>
              </div>

              <div className="card text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Seguro e Confiável</h3>
                <p className="text-gray-600">
                  Plataforma segura com verificação de empresas e sistema de avaliações.
                </p>
              </div>

              <div className="card text-center">
                <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-secondary-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Gestão de Equipe</h3>
                <p className="text-gray-600">
                  Gerencie múltiplos usuários com diferentes níveis de permissão na sua empresa.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Como Funciona
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-20 h-20 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  1
                </div>
                <h3 className="text-xl font-semibold mb-2">Comprador Publica</h3>
                <p className="text-gray-600">
                  O comprador cria uma requisição detalhando sua necessidade, quantidade, prazo e localização.
                </p>
              </div>

              <div className="text-center">
                <div className="w-20 h-20 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  2
                </div>
                <h3 className="text-xl font-semibold mb-2">Vendedores Propoem</h3>
                <p className="text-gray-600">
                  Vendedores relevantes recebem a oportunidade e enviam propostas com preço, prazo e condições.
                </p>
              </div>

              <div className="text-center">
                <div className="w-20 h-20 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  3
                </div>
                <h3 className="text-xl font-semibold mb-2">Comprador Escolhe</h3>
                <p className="text-gray-600">
                  O comprador compara propostas e escolhe a melhor. O contato é liberado e o negócio acontece.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-primary-600 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Pronto para começar?
            </h2>
            <p className="text-xl text-primary-100 mb-8">
              Junte-se a centenas de empresas que já estão usando a Jada para otimizar suas compras e vendas.
            </p>
            <div className="flex justify-center">
              <Link href="/signup">
                <Button size="lg" className="bg-white text-primary-700 hover:bg-primary-50">
                  Criar Conta Grátis
                  <ArrowRight className="w-5 h-5 ml-2 inline" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}


