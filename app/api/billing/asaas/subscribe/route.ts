import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createBillingForCompany, billingTypeFromInput } from '@/lib/asaasBilling';

/**
 * Gera cobrança de assinatura (renovação ou nova). Usado na área financeira quando o usuário já está logado.
 * Cartão: assinatura criada sem dados do cartão; Asaas devolve invoiceUrl (pagamento na página deles).
 */
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.companyId) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const body = await request.json().catch(() => ({} as any));
  const period = typeof body.period === 'string' ? body.period : 'monthly';
  const billingType = billingTypeFromInput(typeof body.billingType === 'string' ? body.billingType : 'BOLETO');

  const result = await createBillingForCompany({
    companyId: session.user.companyId,
    billingType,
    period,
  });

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  const link = result.paymentLink ?? null;
  return NextResponse.json({
    success: true,
    alreadyExists: result.alreadyExists ?? false,
    subscriptionId: result.subscriptionId,
    payment: result.payment
      ? {
          id: result.payment.id,
          status: result.payment.status,
          dueDate: result.payment.dueDate,
          invoiceUrl: link,
          bankSlipUrl: link,
        }
      : null,
  });
}
