import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function getHeader(req: Request, name: string): string | null {
  const v = req.headers.get(name);
  return v ? String(v) : null;
}

function safeString(v: unknown): string | null {
  return typeof v === 'string' && v.trim() ? v.trim() : null;
}

export async function POST(request: Request) {
  const expected = process.env.ASAAS_WEBHOOK_TOKEN || '';
  const provided = getHeader(request, 'asaas-access-token') || '';
  if (!expected || provided !== expected) {
    return NextResponse.json({ error: 'Webhook não autorizado' }, { status: 403 });
  }

  const body = await request.json().catch(() => null as any);
  const event = safeString(body?.event);
  const paymentId = safeString(body?.payment?.id);
  const subscriptionId = safeString(body?.payment?.subscription) || safeString(body?.subscription?.id);
  const externalReference = safeString(body?.payment?.externalReference) || safeString(body?.subscription?.externalReference);

  // Encontrar empresa: prioridade subscriptionId, depois externalReference (companyId)
  let company = null as any;
  if (subscriptionId) {
    company = await prisma.company.findFirst({
      where: { billingSubscriptionId: subscriptionId },
    });
  }
  if (!company && externalReference) {
    company = await prisma.company.findFirst({
      where: { id: externalReference },
    });
  }

  // Sempre registrar o evento para auditoria, mesmo sem company
  if (company) {
    const duplicate =
      event &&
      (await prisma.billingEvent.findFirst({
        where: {
          companyId: company.id,
          eventType: event,
          externalId: paymentId || subscriptionId || null,
        },
        select: { id: true },
      }));
    if (duplicate) {
      return NextResponse.json({ success: true, deduplicated: true });
    }
    await prisma.billingEvent.create({
      data: {
        companyId: company.id,
        provider: 'asaas',
        eventType: event || 'unknown',
        externalId: paymentId || subscriptionId || null,
        payload: body as unknown as object,
      },
    });
  }

  if (!company || !event) {
    return NextResponse.json({ success: true });
  }

  const now = new Date();
  const updates: Record<string, unknown> = {
    billingProvider: 'asaas',
    billingLastEventAt: now,
    billingLastPayload: body as unknown as object,
  };

  // Estados principais (simplificado para o MVP)
  if (event === 'PAYMENT_CONFIRMED' || event === 'PAYMENT_RECEIVED' || event === 'CHECKOUT_PAID') {
    updates.billingStatus = 'active';
    // Asaas envia dueDate como string YYYY-MM-DD em payment
    const due = safeString(body?.payment?.dueDate);
    if (due) {
      const dt = new Date(`${due}T00:00:00.000Z`);
      if (!isNaN(dt.getTime())) updates.billingNextDueDate = dt;
    }
  } else if (event === 'PAYMENT_OVERDUE') {
    updates.billingStatus = 'past_due';
  } else if (event === 'SUBSCRIPTION_INACTIVATED' || event === 'SUBSCRIPTION_DELETED') {
    updates.billingStatus = 'canceled';
  } else if (event === 'SUBSCRIPTION_CREATED' || event === 'SUBSCRIPTION_UPDATED') {
    // Não muda status aqui sem certeza; mantém o que já está
    updates.billingStatus = company.billingStatus ?? 'pending';
  }

  await prisma.company.update({
    where: { id: company.id },
    data: updates,
  });

  return NextResponse.json({ success: true });
}

