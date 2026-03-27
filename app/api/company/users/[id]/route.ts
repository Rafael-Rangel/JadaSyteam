import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.companyId) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, role: true, companyId: true, deletedAt: true },
  });
  if (!user || user.companyId !== session.user.companyId) {
    return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 });
  }
  if (user.deletedAt) {
    return NextResponse.json({ error: 'Usuário já removido.' }, { status: 400 });
  }
  if (user.role === 'owner') {
    return NextResponse.json({ error: 'Não é permitido remover o usuário owner.' }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { deletedAt: new Date() },
  });

  return NextResponse.json({ success: true });
}
