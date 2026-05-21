import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { isAsaasConfigured } from '@/lib/asaas';
import { isEscavadorConfigured } from '@/lib/providers/escavador';
import { withNoStore } from '@/lib/apiSecurity';

export async function GET() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string })?.role;
  if (role !== 'admin') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
  }

  return withNoStore(
    NextResponse.json({
      asaas: {
        configured: isAsaasConfigured(),
        serasaViaAsaas: true,
      },
      escavador: {
        configured: isEscavadorConfigured(),
      },
    })
  );
}
