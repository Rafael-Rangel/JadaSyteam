import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { planSlugExists } from '@/lib/planService';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string })?.role;
  if (role !== 'admin') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
  }

  const { id } = await params;
  const company = await prisma.company.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      cnpj: true,
      type: true,
      plan: true,
      verificationStatus: true,
      verifiedAt: true,
      verificationPayload: true,
    },
  });

  if (!company) {
    return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 });
  }

  return NextResponse.json(company);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string })?.role;
  if (role !== 'admin') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const { plan, verificationStatus } = body as { plan?: string; verificationStatus?: string };

  const updates: { plan?: string; verificationStatus?: string; verifiedAt?: Date } = {};
  if (typeof plan === 'string' && plan.trim()) {
    const slug = plan.trim();
    const exists = await planSlugExists(slug);
    if (!exists) {
      return NextResponse.json(
        { error: 'Plano inválido. Escolha um plano existente na lista.' },
        { status: 400 }
      );
    }
    updates.plan = slug;
  }
  if (verificationStatus === 'approved' || verificationStatus === 'rejected') {
    updates.verificationStatus = verificationStatus;
    updates.verifiedAt = new Date();
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'Nenhuma alteração enviada (plan ou verificationStatus).' }, { status: 400 });
  }

  const company = await prisma.company.update({
    where: { id },
    data: updates,
  }).catch(() => null);

  if (!company) {
    return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 });
  }

  return NextResponse.json(company);
}
