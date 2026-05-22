import { NextRequest, NextResponse } from 'next/server';
import { getServerSession, type Session } from 'next-auth';
import bcrypt from 'bcryptjs';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { PLATFORM_COMPANY_CNPJ } from '@/lib/platformCompany';
import { enforceSameOrigin, withNoStore } from '@/lib/apiSecurity';
import {
  countActiveAdmins,
  getPlatformUserById,
  parsePlatformRole,
  validateCompanyIds,
  type PlatformRole,
} from '@/lib/platformUsers';

function requireAdmin(session: Session | null) {
  const role = (session?.user as { role?: string })?.role;
  if (role !== 'admin') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
  }
  return null;
}

async function findPlatformUserRecord(id: string) {
  const company = await prisma.company.findFirst({
    where: { cnpj: PLATFORM_COMPANY_CNPJ },
    select: { id: true },
  });
  if (!company) return null;
  return prisma.user.findFirst({
    where: {
      id,
      companyId: company.id,
      role: { in: ['admin', 'assistant'] },
    },
  });
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  const denied = requireAdmin(session);
  if (denied) return denied;

  const { id } = await params;
  const user = await getPlatformUserById(id);
  if (!user) {
    return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
  }

  const audit =
    user.role === 'assistant'
      ? await prisma.assistantAuditLog.findMany({
          where: { assistantUserId: id },
          orderBy: { createdAt: 'desc' },
          take: 30,
          select: {
            id: true,
            action: true,
            companyId: true,
            metadata: true,
            createdAt: true,
          },
        })
      : [];

  return withNoStore(NextResponse.json({ user, audit }));
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

  const currentAdminId = (session?.user as { id?: string })?.id;
  const { id } = await params;

  const existing = await findPlatformUserRecord(id);
  if (!existing || existing.deletedAt) {
    return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
  }

  const body = await request.json().catch(() => ({}));
  const updates: {
    name?: string;
    email?: string;
    phone?: string | null;
    role?: PlatformRole;
    restrictToAssignedCompanies?: boolean;
    password?: string;
    deletedAt?: Date | null;
  } = {};

  if (typeof body.name === 'string' && body.name.trim()) updates.name = body.name.trim();
  if (typeof body.email === 'string') {
    const emailNorm = body.email.trim().toLowerCase();
    if (!emailNorm || !/\S+@\S+\.\S+/.test(emailNorm)) {
      return NextResponse.json({ error: 'E-mail inválido.' }, { status: 400 });
    }
    if (emailNorm !== existing.email) {
      const taken = await prisma.user.findUnique({ where: { email: emailNorm } });
      if (taken) {
        return NextResponse.json({ error: 'Este e-mail já está em uso.' }, { status: 409 });
      }
      updates.email = emailNorm;
    }
  }
  if (body.phone !== undefined) updates.phone = body.phone?.trim() || null;
  if (typeof body.password === 'string' && body.password.length >= 8) {
    updates.password = await bcrypt.hash(body.password, 12);
  }

  const newRole = body.role !== undefined ? parsePlatformRole(body.role) : null;
  if (body.role !== undefined && !newRole) {
    return NextResponse.json({ error: 'Papel inválido.' }, { status: 400 });
  }

  const targetRole = (newRole ?? existing.role) as PlatformRole;

  if (newRole === 'admin' && existing.role === 'assistant') {
    updates.role = 'admin';
    updates.restrictToAssignedCompanies = false;
    await prisma.assistantCompanyAssignment.deleteMany({ where: { assistantUserId: id } });
  } else if (newRole === 'assistant' && existing.role === 'admin') {
    if (id === currentAdminId) {
      return NextResponse.json(
        { error: 'Você não pode alterar seu próprio papel para assistente.' },
        { status: 400 }
      );
    }
    const otherAdmins = await countActiveAdmins(id);
    if (otherAdmins < 1) {
      return NextResponse.json(
        { error: 'Deve existir pelo menos um administrador ativo na plataforma.' },
        { status: 400 }
      );
    }
    updates.role = 'assistant';
    if (typeof body.restrictToAssignedCompanies === 'boolean') {
      updates.restrictToAssignedCompanies = body.restrictToAssignedCompanies;
    } else if (existing.restrictToAssignedCompanies === undefined) {
      updates.restrictToAssignedCompanies = true;
    }
  }

  if (targetRole === 'assistant' && typeof body.restrictToAssignedCompanies === 'boolean') {
    updates.restrictToAssignedCompanies = body.restrictToAssignedCompanies;
  }

  if (body.active === true && existing.deletedAt) {
    updates.deletedAt = null;
  }

  if (Object.keys(updates).length > 0) {
    await prisma.user.update({ where: { id }, data: updates });
  }

  if (targetRole === 'assistant' && Array.isArray(body.companyIds)) {
    const validated = await validateCompanyIds(body.companyIds);
    if ('error' in validated) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }
    await prisma.assistantCompanyAssignment.deleteMany({ where: { assistantUserId: id } });
    if (validated.length > 0) {
      await prisma.assistantCompanyAssignment.createMany({
        data: validated.map((companyId) => ({
          assistantUserId: id,
          companyId,
          assignedByUserId: currentAdminId ?? null,
        })),
      });
    }
  }

  const updated = await getPlatformUserById(id);
  return withNoStore(NextResponse.json({ success: true, user: updated }));
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  const denied = requireAdmin(session);
  if (denied) return denied;

  const currentAdminId = (session?.user as { id?: string })?.id;
  const { id } = await params;

  if (id === currentAdminId) {
    return NextResponse.json({ error: 'Você não pode desativar sua própria conta.' }, { status: 400 });
  }

  const existing = await findPlatformUserRecord(id);
  if (!existing || existing.deletedAt) {
    return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
  }

  if (existing.role === 'admin') {
    const otherAdmins = await countActiveAdmins(id);
    if (otherAdmins < 1) {
      return NextResponse.json(
        { error: 'Não é possível desativar o último administrador da plataforma.' },
        { status: 400 }
      );
    }
  }

  await prisma.user.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  return withNoStore(NextResponse.json({ success: true }));
}
