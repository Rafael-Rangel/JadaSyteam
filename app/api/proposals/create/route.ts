import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getPlanBySlugOrFallback } from '@/lib/planService';
import { requireActiveBilling } from '@/lib/requireActiveBilling';

export async function POST(request: Request) {
  const access = await requireActiveBilling();
  if (!access.ok) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }

  const company = await prisma.company.findUnique({
    where: { id: access.context.companyId },
  });
  if (!company || (company.type !== 'seller' && company.type !== 'both')) {
    return NextResponse.json({ error: 'Empresa não é vendedora' }, { status: 403 });
  }
  if (company.verificationStatus !== 'approved') {
    return NextResponse.json(
      { error: 'Sua empresa está em análise de CNPJ. Você não pode enviar propostas até a aprovação.' },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { requestId, price, deliveryDays, details, validity } = body;

    if (!requestId || !price || !deliveryDays) {
      return NextResponse.json(
        { error: 'Preencha preço e prazo de entrega.' },
        { status: 400 }
      );
    }

    const req = await prisma.request.findUnique({
      where: { id: requestId },
    });
    if (!req) {
      return NextResponse.json({ error: 'Requisição não encontrada' }, { status: 404 });
    }
    if (req.buyerId === access.context.companyId) {
      return NextResponse.json({ error: 'Não é possível enviar proposta para sua própria requisição' }, { status: 400 });
    }
    if (req.status !== 'open' && req.status !== 'receiving') {
      return NextResponse.json({ error: 'Requisição não está aceitando propostas' }, { status: 400 });
    }

    const existing = await prisma.proposal.findFirst({
      where: {
        requestId,
        sellerId: access.context.companyId,
      },
    });
    if (existing) {
      return NextResponse.json({ error: 'Você já enviou uma proposta para esta requisição' }, { status: 409 });
    }

    const planData = await getPlanBySlugOrFallback(company.plan);
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const proposalsThisMonth = await prisma.proposal.count({
      where: {
        sellerId: session.user.companyId,
        // guarded by active billing helper
        createdAt: { gte: startOfMonth },
      },
    });
    if (proposalsThisMonth >= planData.proposalsPerMonthLimit) {
      return NextResponse.json(
        { error: 'Limite de propostas do mês atingido. Faça upgrade do plano.' },
        { status: 403 }
      );
    }

    await prisma.proposal.create({
      data: {
        requestId,
        sellerId: access.context.companyId,
        price: String(price),
        deliveryDays: String(deliveryDays),
        details: details?.trim() || null,
        validity: validity?.trim() || null,
      },
    });

    await prisma.request.update({
      where: { id: requestId },
      data: { status: 'receiving' },
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('Create proposal error:', e);
    return NextResponse.json(
      { error: 'Erro ao enviar proposta.' },
      { status: 500 }
    );
  }
}
