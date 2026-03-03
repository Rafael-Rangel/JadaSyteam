import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getPlanBySlugOrFallback } from '@/lib/planService';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.companyId) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const buyerOnly = searchParams.get('buyerOnly'); // list only my company's requests

  if (buyerOnly === 'true') {
    const requests = await prisma.request.findMany({
      where: { buyerId: session.user.companyId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { proposals: true } },
      },
    });
    return NextResponse.json(
      requests.map((r) => ({
        id: r.id,
        title: r.title,
        status: r.status,
        proposals: r._count.proposals,
        created: r.createdAt.toISOString().slice(0, 10),
        expires: r.expiresAt?.toISOString().slice(0, 10),
      }))
    );
  }

  // For seller: list requests that are open/receiving (opportunities)
  const opportunities = await prisma.request.findMany({
    where: {
      status: { in: ['open', 'receiving'] },
      isPublic: true,
    },
    orderBy: { createdAt: 'desc' },
    include: {
      buyer: { select: { name: true, id: true } },
      proposals: {
        where: { sellerId: session.user.companyId },
        select: { id: true },
      },
    },
  });

  return NextResponse.json(
    opportunities.map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      buyer: r.buyer.name,
      buyerId: r.buyer.id,
      category: r.category,
      city: r.city,
      state: r.state,
      deliveryDate: r.deliveryDate,
      created: r.createdAt.toISOString().slice(0, 10),
      hasProposal: r.proposals.length > 0,
    }))
  );
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.companyId) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const company = await prisma.company.findUnique({
    where: { id: session.user.companyId },
  });
  if (!company || (company.type !== 'buyer' && company.type !== 'both')) {
    return NextResponse.json({ error: 'Empresa não é compradora' }, { status: 403 });
  }
  if (company.verificationStatus !== 'approved') {
    return NextResponse.json(
      { error: 'Sua empresa está em análise de CNPJ. Você não pode criar requisições de compra até a aprovação.' },
      { status: 403 }
    );
  }

  const planData = await getPlanBySlugOrFallback(company.plan);
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const requestsThisMonth = await prisma.request.count({
    where: {
      buyerId: session.user.companyId,
      createdAt: { gte: startOfMonth },
    },
  });
  if (requestsThisMonth >= planData.requestsPerMonthLimit) {
    return NextResponse.json(
      { error: `Limite de ${planData.requestsPerMonthLimit} requisições por mês do plano ${company.plan}. Faça upgrade para criar mais.` },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const {
      title,
      description,
      quantity,
      unit,
      category,
      deliveryDate,
      address,
      city,
      state,
      isPublic,
    } = body;

    if (!title?.trim() || !description?.trim() || !quantity || !category || !deliveryDate || !address?.trim() || !city?.trim() || !state?.trim()) {
      return NextResponse.json(
        { error: 'Preencha todos os campos obrigatórios.' },
        { status: 400 }
      );
    }

    const expiresAt = new Date(deliveryDate);
    expiresAt.setDate(expiresAt.getDate() + 30);

    const req = await prisma.request.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        quantity: String(quantity),
        unit: unit || 'pcs',
        category: category.trim(),
        deliveryDate: String(deliveryDate),
        address: address.trim(),
        city: city.trim(),
        state: state.trim(),
        isPublic: isPublic !== false,
        buyerId: session.user.companyId,
        expiresAt,
      },
    });

    return NextResponse.json({ id: req.id, success: true });
  } catch (e) {
    console.error('Create request error:', e);
    return NextResponse.json(
      { error: 'Erro ao criar requisição.' },
      { status: 500 }
    );
  }
}
