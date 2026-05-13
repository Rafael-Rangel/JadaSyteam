import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { runDueDiligenceForCompany } from '@/lib/dueDiligence';
import { enforceSameOrigin, withNoStore } from '@/lib/apiSecurity';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const sameOriginError = enforceSameOrigin(request);
  if (sameOriginError) return sameOriginError;

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

  const summary = await runDueDiligenceForCompany(id);

  return withNoStore(NextResponse.json({
    success: true,
    verificationStatus: summary.verificationStatus,
    reason: `Verificação concluída (cadastral=${summary.cadastralStatus}, judicial=${summary.judicialStatus}).`,
    riskLevel: summary.riskLevel,
  }));
}
