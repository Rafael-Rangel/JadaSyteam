import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { asaasDeleteSubscription } from '@/lib/asaas';

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.companyId) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const company = await prisma.company.findUnique({
    where: { id: session.user.companyId },
    select: { id: true, billingSubscriptionId: true, billingStatus: true },
  });
  if (!company) {
    return NextResponse.json({ error: 'Empresa não encontrada.' }, { status: 404 });
  }
  if (!company.billingSubscriptionId) {
    return NextResponse.json({ error: 'Empresa não possui assinatura para cancelar.' }, { status: 400 });
  }
  if (company.billingStatus === 'canceled') {
    return NextResponse.json({ error: 'Assinatura já está cancelada.' }, { status: 400 });
  }

  try {
    await asaasDeleteSubscription(company.billingSubscriptionId);
  } catch {
    return NextResponse.json({ error: 'Falha ao cancelar assinatura no Asaas.' }, { status: 502 });
  }

  await prisma.company.update({
    where: { id: company.id },
    data: {
      billingStatus: 'canceled',
      billingLastEventAt: new Date(),
    },
  });

  await prisma.billingEvent.create({
    data: {
      companyId: company.id,
      provider: 'asaas',
      eventType: 'SUBSCRIPTION_CANCELED_BY_USER',
      externalId: company.billingSubscriptionId,
      payload: { source: 'user', at: new Date().toISOString() },
    },
  });

  return NextResponse.json({ success: true });
}
