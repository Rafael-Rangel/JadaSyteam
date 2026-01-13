import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Target, Users, Zap, Shield } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow py-12 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Sobre a Jada</h1>
            <p className="text-xl text-gray-600">
              Conectando compradores e vendedores de forma inteligente
            </p>
          </div>

          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Nossa Missão</h2>
              <p className="text-gray-700 leading-relaxed">
                A Jada foi criada para revolucionar a forma como empresas encontram fornecedores e como fornecedores encontram oportunidades de negócio. Nossa plataforma conecta compradores e vendedores de forma eficiente, transparente e segura, facilitando o processo de cotação e fechamento de negócios.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Nossos Valores</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start space-x-3">
                  <Target className="w-6 h-6 text-primary-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Foco no Cliente</h3>
                    <p className="text-gray-600 text-sm">Priorizamos a experiência e satisfação dos nossos usuários.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Users className="w-6 h-6 text-primary-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Transparência</h3>
                    <p className="text-gray-600 text-sm">Acreditamos em processos claros e comunicação aberta.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Zap className="w-6 h-6 text-primary-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Inovação</h3>
                    <p className="text-gray-600 text-sm">Buscamos constantemente melhorar nossa plataforma.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Shield className="w-6 h-6 text-primary-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Segurança</h3>
                    <p className="text-gray-600 text-sm">Protegemos os dados e informações dos nossos usuários.</p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}



