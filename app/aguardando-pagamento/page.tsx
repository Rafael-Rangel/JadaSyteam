'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Card from '@/components/Card';
import Button from '@/components/Button';
import { ExternalLink, Loader2 } from 'lucide-react';

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
        <main className="flex-grow py-12 bg-gray-50 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header userType="buyer" />
      <main className="flex-grow py-12 bg-gray-50">
        <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <div className="text-center space-y-4">
              <h1 className="text-2xl font-bold text-gray-900">Aguardando confirmação do pagamento</h1>
              {approvalStatus !== 'approved' ? (
                <p className="text-gray-600">
                  Seu cadastro foi recebido e está em análise pela equipe. Assim que sua empresa for aprovada, a cobrança será gerada e o botão de pagamento aparecerá aqui.
                </p>
              ) : billingStatus === 'active' ? (
                <p className="text-gray-600">
                  Pagamento confirmado com sucesso. Seu acesso completo está sendo liberado. Clique em atualizar status para continuar.
                </p>
              ) : (
                <p className="text-gray-600">
                  Sua empresa foi aprovada. Agora finalize o pagamento para liberar o acesso completo à plataforma.
                </p>
              )}
              {approvalStatus === 'approved' && billingStatus !== 'active' && paymentLink ? (
                <a
                  href={paymentLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700"
                >
                  Abrir página de pagamento <ExternalLink className="w-4 h-4" />
                </a>
              ) : approvalStatus === 'approved' && billingStatus !== 'active' ? (
                <p className="text-sm text-amber-600">
                  Link de pagamento não disponível no momento. Entre em contato com o suporte ou tente novamente mais tarde.
                </p>
              ) : approvalStatus === 'approved' && billingStatus === 'active' ? (
                <p className="text-sm text-emerald-600">
                  Pagamento identificado. Se ainda estiver bloqueado, atualize esta página.
                </p>
              ) : (
                <p className="text-sm text-gray-500">
                  Status atual: em análise administrativa.
                </p>
              )}
              {approvalStatus === 'approved' && (
                <p className="text-sm text-gray-500">
                  Método escolhido: {preferredBillingType === 'CREDIT_CARD' ? 'Cartão de crédito' : preferredBillingType === 'PIX' ? 'PIX' : preferredBillingType === 'BOLETO' ? 'Boleto' : 'Não informado'}
                  {billingStatus ? ` · Cobrança: ${billingStatus}` : ''}
                </p>
              )}
              <div className="pt-4 flex justify-center">
                <Button variant="outline" onClick={() => router.refresh()}>
                  Atualizar status
                </Button>
              </div>
              <p className="text-sm text-gray-500">
                <Link href="/login" className="text-primary-600 hover:underline">Sair e fazer login</Link> em outro momento.
              </p>
            </div>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
