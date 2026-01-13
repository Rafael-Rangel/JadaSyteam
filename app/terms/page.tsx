import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow py-12 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Termos de Uso</h1>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 space-y-6">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Aceitação dos Termos</h2>
              <p className="text-gray-700 leading-relaxed">
                Ao acessar e usar a plataforma Jada, você concorda em cumprir e estar vinculado a estes Termos de Uso. Se você não concordar com alguma parte destes termos, não deve usar nossos serviços.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Uso da Plataforma</h2>
              <p className="text-gray-700 leading-relaxed">
                Você concorda em usar a plataforma apenas para fins legais e de acordo com estes termos. É proibido usar a plataforma de forma que possa danificar, desabilitar, sobrecarregar ou comprometer nossos servidores ou redes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Contas de Usuário</h2>
              <p className="text-gray-700 leading-relaxed">
                Você é responsável por manter a confidencialidade de sua conta e senha. Você concorda em notificar-nos imediatamente sobre qualquer uso não autorizado de sua conta.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Assinaturas e Pagamentos</h2>
              <p className="text-gray-700 leading-relaxed">
                As assinaturas são cobradas mensalmente. Você concorda em pagar todas as taxas associadas à sua assinatura. O não pagamento pode resultar na suspensão ou cancelamento do acesso aos serviços.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Limitação de Responsabilidade</h2>
              <p className="text-gray-700 leading-relaxed">
                A plataforma Jada é fornecida "como está". Não garantimos que o serviço será ininterrupto, seguro ou livre de erros. Não seremos responsáveis por quaisquer danos diretos, indiretos ou consequenciais resultantes do uso de nossos serviços.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Propriedade Intelectual</h2>
              <p className="text-gray-700 leading-relaxed">
                Todo o conteúdo da plataforma, incluindo textos, gráficos, logos e software, é propriedade da Jada e está protegido por leis de direitos autorais e outras leis de propriedade intelectual.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Modificações dos Termos</h2>
              <p className="text-gray-700 leading-relaxed">
                Reservamos o direito de modificar estes termos a qualquer momento. As alterações entrarão em vigor imediatamente após a publicação. O uso continuado da plataforma após as alterações constitui aceitação dos novos termos.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Contato</h2>
              <p className="text-gray-700 leading-relaxed">
                Se você tiver dúvidas sobre estes Termos de Uso, entre em contato conosco em contato@jada.com.br.
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



