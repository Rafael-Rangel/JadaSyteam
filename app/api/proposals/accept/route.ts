import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.companyId) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const company = await prisma.company.findUnique({
    where: { id: session.user.companyId },
  });
  if (!company) {
    return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 403 });
  }
  if (company.verificationStatus !== 'approved') {
    return NextResponse.json(
      { error: 'Sua empresa está em análise de CNPJ. Você não pode aceitar propostas até a aprovação.' },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { proposalId } = body;
    if (!proposalId) {
      return NextResponse.json({ error: 'proposalId obrigatório' }, { status: 400 });
    }

    const proposal = await prisma.proposal.findUnique({
      where: { id: proposalId },
      include: { request: true },
    });
    if (!proposal) {
      return NextResponse.json({ error: 'Proposta não encontrada' }, { status: 404 });
    }
    if (proposal.request.buyerId !== session.user.companyId) {
      return NextResponse.json({ error: 'Apenas o comprador pode aceitar esta proposta' }, { status: 403 });
    }

    await prisma.$transaction([
      prisma.proposal.update({
        where: { id: proposalId },
        data: { status: 'accepted' },
      }),
      prisma.request.update({
        where: { id: proposal.requestId },
        data: { status: 'selected' },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('Accept proposal error:', e);
    return NextResponse.json(
      { error: 'Erro ao aceitar proposta.' },
      { status: 500 }
    );
  }
}
