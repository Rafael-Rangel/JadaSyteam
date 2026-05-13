import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { runSerasaForCompany } from '@/lib/dueDiligence';
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
  try {
    const result = await runSerasaForCompany(id);
    return withNoStore(NextResponse.json({
      success: true,
      score: result.score,
      riskLevel: result.riskLevel,
      reason: result.reason,
      status: result.status,
    }));
  } catch (e) {
    return NextResponse.json({ error: 'Falha ao consultar Serasa.' }, { status: 500 });
  }
}
