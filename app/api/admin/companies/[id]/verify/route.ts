import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { verifyCnpjWithBrasilApi } from '@/lib/cnpjVerification';

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string })?.role;
  if (role !== 'admin') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
  }

  const { id } = await params;
  const company = await prisma.company.findUnique({ where: { id } });
  if (!company) {
    return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 });
  }

  const cnpj = company.cnpj?.replace(/\D/g, '') || '';
  if (cnpj.length !== 14) {
    return NextResponse.json(
      { error: 'CNPJ da empresa inválido para verificação.' },
      { status: 400 }
    );
  }

  const result = await verifyCnpjWithBrasilApi(cnpj);
  await prisma.company.update({
    where: { id },
    data: {
      verificationStatus: result.status,
      verifiedAt: new Date(),
      verificationPayload: result.raw ? (result.raw as object) : undefined,
    },
  });

  return NextResponse.json({
    success: true,
    verificationStatus: result.status,
    reason: result.reason,
  });
}
