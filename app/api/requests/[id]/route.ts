import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.companyId) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const { id } = await params;
  const request = await prisma.request.findUnique({
    where: { id },
    include: {
      buyer: { select: { name: true, id: true } },
      proposals: {
        include: {
          seller: { select: { name: true, id: true } },
        },
      },
    },
  });

  if (!request) {
    return NextResponse.json({ error: 'Requisição não encontrada' }, { status: 404 });
  }

  const isBuyer = request.buyerId === session.user.companyId;

  if (isBuyer) {
    return NextResponse.json({
      id: request.id,
      title: request.title,
      description: request.description,
      quantity: request.quantity,
      unit: request.unit,
      category: request.category,
      deliveryDate: request.deliveryDate,
      address: request.address,
      city: request.city,
      state: request.state,
      status: request.status,
      createdAt: request.createdAt.toISOString(),
      expiresAt: request.expiresAt?.toISOString(),
      buyer: request.buyer,
      proposals: request.proposals.map((p) => ({
        id: p.id,
        price: p.price,
        deliveryDays: p.deliveryDays,
        details: p.details,
        validity: p.validity,
        status: p.status,
        seller: p.seller,
        createdAt: p.createdAt.toISOString(),
      })),
    });
  }

  const myProposal = await prisma.proposal.findFirst({
    where: { requestId: id, sellerId: session.user.companyId },
    select: { id: true, status: true },
  });

  return NextResponse.json({
    id: request.id,
    title: request.title,
    description: request.description,
    quantity: request.quantity,
    unit: request.unit,
    category: request.category,
    deliveryDate: request.deliveryDate,
    address: request.address,
    city: request.city,
    state: request.state,
    status: request.status,
    buyer: request.buyer,
    proposals: [],
    myProposal: myProposal ? { id: myProposal.id, status: myProposal.status } : null,
  });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.companyId) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const { id } = await params;
  const existing = await prisma.request.findUnique({ where: { id } });
  if (!existing || existing.buyerId !== session.user.companyId) {
    return NextResponse.json({ error: 'Requisição não encontrada ou acesso negado' }, { status: 404 });
  }

  const body = await request.json();
  if (body.status) {
    await prisma.request.update({
      where: { id },
      data: { status: body.status },
    });
  }
  return NextResponse.json({ success: true });
}
