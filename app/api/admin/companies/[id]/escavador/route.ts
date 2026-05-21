import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { runEscavadorForCompany } from '@/lib/dueDiligence';
import { isEscavadorConfigured } from '@/lib/providers/escavador';
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

  const configured = isEscavadorConfigured();
  const { id } = await params;

  try {
    const result = await runEscavadorForCompany(id);
    const httpStatus = result.status === 'approved' ? 200 : result.status === 'rejected' ? 400 : 502;

    return withNoStore(
      NextResponse.json(
        {
          success: result.status === 'approved',
          configured,
          status: result.status,
          reason: result.reason,
          riskLevel: result.riskLevel,
          totalCases: result.totalCases,
          laborCases: result.laborCases,
          civilCases: result.civilCases,
          highValueCases: result.highValueCases,
        },
        { status: httpStatus }
      )
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Falha ao consultar Escavador.';
    return NextResponse.json(
      { error: msg, reason: msg, configured, success: false },
      { status: 500 }
    );
  }
}
