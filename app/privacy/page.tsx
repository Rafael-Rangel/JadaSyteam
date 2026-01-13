import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow py-12 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Política de Privacidade</h1>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 space-y-6">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Informações que Coletamos</h2>
              <p className="text-gray-700 leading-relaxed">
                Coletamos informações que você nos fornece diretamente, como nome, e-mail, telefone, dados da empresa e informações de pagamento quando você se cadastra em nossa plataforma.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Como Usamos suas Informações</h2>
              <p className="text-gray-700 leading-relaxed">
                Utilizamos suas informações para fornecer, manter e melhorar nossos serviços, processar transações, enviar notificações e comunicar com você sobre produtos e serviços que possam ser do seu interesse.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Compartilhamento de Informações</h2>
              <p className="text-gray-700 leading-relaxed">
                Não vendemos suas informações pessoais. Compartilhamos informações apenas quando necessário para fornecer nossos serviços, cumprir obrigações legais ou com seu consentimento explícito.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Segurança</h2>
              <p className="text-gray-700 leading-relaxed">
                Implementamos medidas de segurança técnicas e organizacionais para proteger suas informações contra acesso não autorizado, alteração, divulgação ou destruição.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Seus Direitos</h2>
              <p className="text-gray-700 leading-relaxed">
                Você tem o direito de acessar, corrigir, excluir ou solicitar uma cópia das suas informações pessoais a qualquer momento entrando em contato conosco.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Alterações nesta Política</h2>
              <p className="text-gray-700 leading-relaxed">
                Podemos atualizar esta política de privacidade periodicamente. Notificaremos você sobre mudanças significativas publicando a nova política nesta página.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Contato</h2>
              <p className="text-gray-700 leading-relaxed">
                Se você tiver dúvidas sobre esta política de privacidade, entre em contato conosco em contato@jada.com.br.
              </p>
            </section>

            <p className="text-sm text-gray-500 mt-8">
              Última atualização: {new Date().toLocaleDateString('pt-BR')}
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}



