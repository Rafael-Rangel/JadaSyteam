import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.companyId) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const proposals = await prisma.proposal.findMany({
    where: { sellerId: session.user.companyId },
    orderBy: { createdAt: 'desc' },
    include: {
      request: {
        select: { id: true, title: true, buyer: { select: { name: true } } },
      },
    },
  });

  return NextResponse.json(
    proposals.map((p) => ({
      id: p.id,
      requestId: p.requestId,
      title: p.request.title,
      buyer: p.request.buyer.name,
      price: p.price,
      deliveryDays: p.deliveryDays,
      status: p.status,
      createdAt: p.createdAt.toISOString(),
    }))
  );
}
