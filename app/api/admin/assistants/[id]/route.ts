import { NextRequest, NextResponse } from 'next/server';
import { getServerSession, type Session } from 'next-auth';
import bcrypt from 'bcryptjs';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { excludePlatformCompanyWhere } from '@/lib/platformCompany';
import { enforceSameOrigin, withNoStore } from '@/lib/apiSecurity';

function requireAdmin(session: Session | null) {
  const role = (session?.user as { role?: string })?.role;
  if (role !== 'admin') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
  }
  return null;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const sameOriginError = enforceSameOrigin(request);
  if (sameOriginError) return sameOriginError;

  const session = await getServerSession(authOptions);
  const denied = requireAdmin(session);
  if (denied) return denied;

  const adminId = (session?.user as { id?: string })?.id;
  const { id } = await params;

  const assistant = await prisma.user.findFirst({
    where: { id, role: 'assistant', deletedAt: null },
  });
  if (!assistant) {
    return NextResponse.json({ error: 'Assistente não encontrado' }, { status: 404 });
  }

  const body = await request.json().catch(() => ({}));
  const updates: {
    name?: string;
    phone?: string | null;
    restrictToAssignedCompanies?: boolean;
    password?: string;
  } = {};

  if (typeof body.name === 'string' && body.name.trim()) updates.name = body.name.trim();
  if (body.phone !== undefined) updates.phone = body.phone?.trim() || null;
  if (typeof body.restrictToAssignedCompanies === 'boolean') {
    updates.restrictToAssignedCompanies = body.restrictToAssignedCompanies;
  }
  if (typeof body.password === 'string' && body.password.length >= 8) {
    updates.password = await bcrypt.hash(body.password, 12);
  }

  if (Object.keys(updates).length > 0) {
    await prisma.user.update({ where: { id }, data: updates });
  }

  if (Array.isArray(body.companyIds)) {
    const idsRaw = body.companyIds as unknown[];
    const companyIds = [...new Set(idsRaw.filter((x): x is string => typeof x === 'string' && x.length > 0))];
    const count = await prisma.company.count({
      where: { id: { in: companyIds }, ...excludePlatformCompanyWhere },
    });
    if (count !== companyIds.length) {
      return NextResponse.json({ error: 'Empresas inválidas na lista.' }, { status: 400 });
    }
    await prisma.assistantCompanyAssignment.deleteMany({ where: { assistantUserId: id } });
    if (companyIds.length > 0) {
      await prisma.assistantCompanyAssignment.createMany({
        data: companyIds.map((companyId) => ({
          assistantUserId: id,
          companyId,
          assignedByUserId: adminId ?? null,
        })),
      });
    }
  }

  if (body.deactivate === true) {
    await prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  return withNoStore(NextResponse.json({ success: true }));
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  const denied = requireAdmin(session);
  if (denied) return denied;

  const { id } = await params;
  const assistant = await prisma.user.findFirst({
    where: { id, role: 'assistant' },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      restrictToAssignedCompanies: true,
      deletedAt: true,
      assistantAssignments: {
        include: { company: { select: { id: true, name: true } } },
      },
      assistantAuditLogs: {
        orderBy: { createdAt: 'desc' },
        take: 50,
        select: { id: true, action: true, companyId: true, metadata: true, createdAt: true },
      },
    },
  });

  if (!assistant) {
    return NextResponse.json({ error: 'Não encontrado' }, { status: 404 });
  }

  return withNoStore(NextResponse.json({ assistant }));
}
