import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { AsaasError } from '@/lib/asaas';
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
    const httpStatus =
      result.status === 'approved' ? 200 : result.status === 'rejected' ? 400 : 502;

    return withNoStore(
      NextResponse.json(
        {
          success: result.status === 'approved',
          provider: result.provider,
          status: result.status,
          reason: result.reason,
          score: result.score,
          riskLevel: result.riskLevel,
          reportId: result.reportId ?? null,
          downloadUrl: result.downloadUrl ?? null,
          dateCreated: result.dateCreated ?? null,
          hasReportFile: result.hasReportFile ?? false,
        },
        { status: httpStatus }
      )
    );
  } catch (e) {
    const msg = e instanceof AsaasError ? e.message : 'Falha ao consultar Serasa via Asaas.';
    const status = e instanceof AsaasError && e.status ? e.status : 500;
    return NextResponse.json({ error: msg, reason: msg }, { status: status >= 400 && status < 600 ? status : 500 });
  }
}
