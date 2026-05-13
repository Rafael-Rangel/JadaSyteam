import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Button from '@/components/Button';
import { ArrowRight, ShoppingCart, Package, TrendingUp, Shield, Zap, Users } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-neutral-50">
      <Header />

      <main className="flex-grow">
        <section className="border-b border-neutral-200 bg-white py-12 sm:py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-between gap-12 lg:flex-row">
              <div className="flex-1 text-center lg:text-left">
                <p className="mb-3 text-sm font-medium uppercase tracking-wide text-primary-600">
                  Cotação B2B
                </p>
                <h1 className="mb-6 text-2xl font-bold leading-tight text-neutral-900 sm:text-3xl md:text-5xl lg:text-6xl">
                  Conecte compradores e vendedores
                  <br />
                  <span className="text-primary-600">de forma inteligente</span>
                </h1>
                <p className="mx-auto mb-8 max-w-2xl text-lg text-neutral-600 md:text-xl lg:mx-0">
                  Publique suas necessidades e receba propostas competitivas dos melhores fornecedores do mercado.
                </p>
                <div className="flex flex-col justify-center gap-4 sm:flex-row lg:justify-start">
                  <Link href="/signup">
                    <Button size="lg" className="w-full sm:w-auto">
                      Começar agora
                      <ArrowRight className="ml-2 inline h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="/plans">
                    <Button size="lg" variant="outline" className="w-full border-neutral-300 sm:w-auto">
                      Ver planos
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="w-full max-w-sm flex-shrink-0 rounded-2xl border border-neutral-200 bg-neutral-50/80 p-6 lg:max-w-md">
                <Image
                  src="/mascote.png"
                  alt="Mascote JADA"
                  width={400}
                  height={500}
                  className="-mb-8 h-auto w-full object-contain drop-shadow-md"
                  priority
                />
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-neutral-200 bg-neutral-50 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl font-bold text-neutral-900 md:text-4xl">Por que escolher a Jada?</h2>
              <p className="mx-auto max-w-2xl text-xl text-neutral-600">
                Uma plataforma completa para otimizar suas compras e vendas
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: ShoppingCart,
                  tone: 'bg-primary-50 text-primary-600',
                  title: 'Para compradores',
                  text: 'Publique suas necessidades e receba múltiplas propostas competitivas dos melhores fornecedores.',
                },
                {
                  icon: Package,
                  tone: 'bg-secondary-100 text-secondary-600',
                  title: 'Para vendedores',
                  text: 'Receba oportunidades relevantes e envie propostas diretamente para compradores qualificados.',
                },
                {
                  icon: TrendingUp,
                  tone: 'bg-success-50 text-success-600',
                  title: 'Economia',
                  text: 'Compare preços, prazos e condições para tomar a melhor decisão.',
                },
                {
                  icon: Zap,
                  tone: 'bg-warning-50 text-warning-700',
                  title: 'Rápido e eficiente',
                  text: 'Processo simplificado que economiza tempo e agiliza suas negociações.',
                },
                {
                  icon: Shield,
                  tone: 'bg-primary-50 text-primary-600',
                  title: 'Seguro e confiável',
                  text: 'Plataforma segura com verificação de empresas e sistema de avaliações.',
                },
                {
                  icon: Users,
                  tone: 'bg-secondary-100 text-secondary-600',
                  title: 'Gestão de equipe',
                  text: 'Gerencie múltiplos usuários com diferentes níveis de permissão na sua empresa.',
                },
              ].map(({ icon: Icon, tone, title, text }) => (
                <div key={title} className="card card-padding-lg text-center">
                  <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${tone}`}>
                    <Icon className="h-8 w-8" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-neutral-900">{title}</h3>
                  <p className="text-neutral-600">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl font-bold text-neutral-900 md:text-4xl">Como funciona</h2>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {[
                {
                  step: '1',
                  title: 'Comprador publica',
                  text: 'O comprador cria uma requisição detalhando necessidade, quantidade, prazo e localização.',
                },
                {
                  step: '2',
                  title: 'Vendedores propõem',
                  text: 'Vendedores relevantes recebem a oportunidade e enviam propostas com preço, prazo e condições.',
                },
                {
                  step: '3',
                  title: 'Comprador escolhe',
                  text: 'O comprador compara propostas e escolhe a melhor. O contato é liberado e o negócio acontece.',
                },
              ].map(({ step, title, text }) => (
                <div key={step} className="text-center">
                  <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary-600 text-2xl font-bold text-white">
                    {step}
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-neutral-900">{title}</h3>
                  <p className="text-neutral-600">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-neutral-200 bg-neutral-100 py-20">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="mb-4 text-3xl font-bold text-neutral-900 md:text-4xl">Pronto para começar?</h2>
            <p className="mb-8 text-xl text-neutral-600">
              Junte-se a empresas que já usam a Jada para otimizar compras e vendas.
            </p>
            <Link href="/signup">
              <Button size="lg">
                Criar conta
                <ArrowRight className="ml-2 inline h-5 w-5" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
