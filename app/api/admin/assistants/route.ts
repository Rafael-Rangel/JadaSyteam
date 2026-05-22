import { NextResponse } from 'next/server';
import { getServerSession, type Session } from 'next-auth';
import bcrypt from 'bcryptjs';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { excludePlatformCompanyWhere } from '@/lib/platformCompany';
import { getPlatformCompanyId } from '@/lib/platformCompanyDb';
import { enforceSameOrigin, withNoStore } from '@/lib/apiSecurity';

function requireAdmin(session: Session | null) {
  const role = (session?.user as { role?: string })?.role;
  if (role !== 'admin') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
  }
  return null;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  const denied = requireAdmin(session);
  if (denied) return denied;

  const assistants = await prisma.user.findMany({
    where: { role: 'assistant', deletedAt: null },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      restrictToAssignedCompanies: true,
      createdAt: true,
      assistantAssignments: {
        include: {
          company: { select: { id: true, name: true, type: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return withNoStore(
    NextResponse.json({
      assistants: assistants.map((a) => ({
        id: a.id,
        name: a.name,
        email: a.email,
        phone: a.phone,
        restrictToAssignedCompanies: a.restrictToAssignedCompanies,
        createdAt: a.createdAt.toISOString(),
        assignments: a.assistantAssignments.map((x) => ({
          companyId: x.company.id,
          companyName: x.company.name,
          companyType: x.company.type,
        })),
      })),
    })
  );
}

export async function POST(request: Request) {
  const sameOriginError = enforceSameOrigin(request);
  if (sameOriginError) return sameOriginError;

  const session = await getServerSession(authOptions);
  const denied = requireAdmin(session);
  if (denied) return denied;

  const adminId = (session?.user as { id?: string })?.id;

  let body: {
    name?: string;
    email?: string;
    password?: string;
    phone?: string;
    restrictToAssignedCompanies?: boolean;
    companyIds?: string[];
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const name = body.name?.trim();
  const email = body.email?.trim().toLowerCase();
  const password = body.password;
  if (!name || !email || !password || password.length < 8) {
    return NextResponse.json(
      { error: 'Nome, e-mail e senha (mín. 8 caracteres) são obrigatórios.' },
      { status: 400 }
    );
  }

  const platformCompanyId = await getPlatformCompanyId();
  if (!platformCompanyId) {
    return NextResponse.json(
      { error: 'Empresa sistema não encontrada. Execute npm run create-admin.' },
      { status: 500 }
    );
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: 'E-mail já cadastrado.' }, { status: 409 });
  }

  const companyIds = Array.isArray(body.companyIds)
    ? [...new Set(body.companyIds.filter((id) => typeof id === 'string'))]
    : [];

  if (companyIds.length > 0) {
    const count = await prisma.company.count({
      where: { id: { in: companyIds }, ...excludePlatformCompanyWhere },
    });
    if (count !== companyIds.length) {
      return NextResponse.json({ error: 'Uma ou mais empresas são inválidas.' }, { status: 400 });
    }
  }

  const restrictToAssignedCompanies = body.restrictToAssignedCompanies !== false;
  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      phone: body.phone?.trim() || null,
      password: hashedPassword,
      role: 'assistant',
      companyId: platformCompanyId,
      restrictToAssignedCompanies,
      assistantAssignments: {
        create: companyIds.map((companyId) => ({
          companyId,
          assignedByUserId: adminId ?? null,
        })),
      },
    },
    select: { id: true, email: true },
  });

  return NextResponse.json({ success: true, id: user.id, email: user.email }, { status: 201 });
}
