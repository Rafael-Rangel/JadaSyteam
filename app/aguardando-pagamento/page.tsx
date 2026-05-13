'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Card from '@/components/Card';
import Button from '@/components/Button';
import { ExternalLink, Loader2, CheckCircle2, Clock } from 'lucide-react';

function labelBillingStatus(status: string | null): string {
  switch (status) {
    case 'pending':
      return 'Aguardando confirmação do pagamento';
    case 'active':
      return 'Pagamento confirmado';
    case 'trialing':
      return 'Em período de teste';
    case 'past_due':
      return 'Pagamento em atraso';
    case 'canceled':
      return 'Assinatura cancelada';
    default:
      return status ? `Situação: ${status}` : 'Cobrança em preparação';
  }
}

export default function AguardandoPagamentoPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [paymentLink, setPaymentLink] = useState<string | null>(null);
  const [approvalStatus, setApprovalStatus] = useState<string>('pending');
  const [billingStatus, setBillingStatus] = useState<string | null>(null);
  const [preferredBillingType, setPreferredBillingType] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
      return;
    }
    if (status !== 'authenticated') return;

    fetch('/api/company/payment-link')
      .then((r) => r.json())
      .then((d) => {
        setPaymentLink(d.paymentLink ?? null);
        setApprovalStatus(d.approvalStatus ?? 'pending');
        setBillingStatus(d.status ?? null);
        setPreferredBillingType(d.preferredBillingType ?? null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [status, router]);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header userType="buyer" />
        <main className="flex-grow py-12 bg-neutral-50 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header userType="buyer" />
      <main className="flex-grow py-12 bg-neutral-50">
        <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <div className="text-center space-y-5">
              {approvalStatus !== 'approved' ? (
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 ring-1 ring-neutral-200/80">
                  <Clock className="h-7 w-7 text-neutral-500" aria-hidden />
                </div>
              ) : (
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 ring-1 ring-emerald-100">
                  <CheckCircle2 className="h-7 w-7 text-emerald-600" aria-hidden />
                </div>
              )}

              <div className="space-y-1">
                <h1 className="text-xl font-semibold tracking-tight text-neutral-900 sm:text-2xl">
                  {approvalStatus !== 'approved'
                    ? 'Cadastro em análise'
                    : billingStatus === 'active'
                      ? 'Tudo certo por aqui'
                      : 'Próximo passo: pagamento'}
                </h1>
                <p className="text-sm text-neutral-600 sm:text-base">
                  {approvalStatus !== 'approved' ? (
                    <>Recebemos seus dados. Quando a empresa for aprovada, geramos a cobrança e liberamos o link de pagamento aqui.</>
                  ) : billingStatus === 'active' ? (
                    <>O pagamento foi reconhecido. Atualize o status abaixo se o painel ainda não liberou o acesso completo.</>
                  ) : (
                    <>Sua empresa já está aprovada. Conclua o pagamento da assinatura para usar todos os recursos da plataforma.</>
                  )}
                </p>
              </div>

              {approvalStatus === 'approved' && billingStatus !== 'active' && (
                <ul className="mx-auto max-w-md space-y-2.5 rounded-xl border border-emerald-100 bg-emerald-50/60 px-4 py-3 text-left text-sm text-neutral-700">
                  <li className="flex gap-2.5">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
                    <span className="leading-snug">Empresa aprovada — cadastro liberado para cobrança.</span>
                  </li>
                  <li className="flex gap-2.5">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
                    <span className="leading-snug">
                      {paymentLink
                        ? 'Use o botão abaixo para abrir o checkout seguro e finalizar.'
                        : 'Assim que o link estiver disponível, ele aparecerá aqui.'}
                    </span>
                  </li>
                </ul>
              )}

              {approvalStatus === 'approved' && billingStatus !== 'active' && paymentLink ? (
                <a
                  href={paymentLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-6 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-primary-700"
                >
                  Ir ao pagamento <ExternalLink className="h-4 w-4 opacity-90" />
                </a>
              ) : approvalStatus === 'approved' && billingStatus !== 'active' ? (
                <p className="text-sm text-amber-700">
                  O link de pagamento ainda não está disponível. Tente atualizar em alguns minutos ou fale com o suporte.
                </p>
              ) : approvalStatus === 'approved' && billingStatus === 'active' ? (
                <p className="text-sm font-medium text-emerald-700">
                  Pagamento identificado. Se algo não atualizar, use &quot;Atualizar status&quot;.
                </p>
              ) : (
                <p className="text-sm text-neutral-500">Etapa atual: análise da equipe.</p>
              )}

              {approvalStatus === 'approved' && (
                <p className="text-xs text-neutral-500 sm:text-sm">
                  <span className="text-neutral-600">Forma preferida:</span>{' '}
                  {preferredBillingType === 'CREDIT_CARD'
                    ? 'Cartão de crédito'
                    : preferredBillingType === 'PIX'
                      ? 'PIX'
                      : preferredBillingType === 'BOLETO'
                        ? 'Boleto'
                        : 'Não informada'}
                  <span className="text-neutral-400"> · </span>
                  <span className="text-neutral-600">{labelBillingStatus(billingStatus)}</span>
                </p>
              )}

              <div className="flex justify-center pt-1">
                <Button variant="outline" onClick={() => router.refresh()}>
                  Atualizar status
                </Button>
              </div>
              <p className="text-sm text-neutral-500">
                <Link href="/login" className="text-primary-600 hover:underline">
                  Encerrar sessão
                </Link>{' '}
                e voltar depois, se preferir.
              </p>
            </div>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
