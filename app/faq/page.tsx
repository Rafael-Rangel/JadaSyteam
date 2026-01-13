import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Card from '@/components/Card';
import { ChevronDown } from 'lucide-react';

export default function FAQPage() {
  const faqs = [
    {
      question: 'Como funciona a plataforma Jada?',
      answer: 'A Jada conecta compradores e vendedores. Compradores publicam suas necessidades e vendedores enviam propostas. O comprador escolhe a melhor proposta e o contato é liberado para finalizar o negócio.',
    },
    {
      question: 'Quanto custa usar a plataforma?',
      answer: 'Oferecemos três planos: Starter (R$ 49/mês), Growth (R$ 199/mês) e Enterprise (R$ 799/mês). Cada plano tem limites diferentes de usuários, requisições e propostas.',
    },
    {
      question: 'Posso ser comprador e vendedor ao mesmo tempo?',
      answer: 'Sim! Você pode escolher ser apenas comprador, apenas vendedor ou ambos ao se cadastrar.',
    },
    {
      question: 'Como os vendedores recebem as oportunidades?',
      answer: 'Vendedores recebem oportunidades baseadas no raio configurado (padrão 20km), categorias de interesse e compradores que estão seguindo.',
    },
    {
      question: 'O vendedor pode editar uma proposta depois de enviada?',
      answer: 'Sim, o vendedor pode editar a proposta enquanto ela não foi aceita pelo comprador. Após o aceite, não é mais possível editar.',
    },
    {
      question: 'Como funciona o pagamento?',
      answer: 'O pagamento é feito mensalmente via cartão de crédito. A cobrança é automática e recorrente. Se o pagamento falhar, o acesso é suspenso após período de carência.',
    },
    {
      question: 'Posso cancelar minha assinatura a qualquer momento?',
      answer: 'Sim, você pode cancelar sua assinatura a qualquer momento. O acesso será mantido até o fim do período já pago.',
    },
    {
      question: 'Como entro em contato com o suporte?',
      answer: 'Você pode entrar em contato conosco por e-mail (contato@jada.com.br) ou através do chat na plataforma (disponível no plano Growth e Enterprise).',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow py-12 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Perguntas Frequentes</h1>
            <p className="text-xl text-gray-600">
              Tire suas dúvidas sobre a plataforma Jada
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index}>
                <details className="group">
                  <summary className="flex items-center justify-between cursor-pointer list-none">
                    <h3 className="font-semibold text-gray-900 pr-4">{faq.question}</h3>
                    <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0 transform group-open:rotate-180 transition-transform" />
                  </summary>
                  <p className="mt-4 text-gray-600 leading-relaxed">{faq.answer}</p>
                </details>
              </Card>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}



