import { NextRequest, NextResponse } from 'next/server';
import { getServerSession, type Session } from 'next-auth';
import bcrypt from 'bcryptjs';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getPlatformCompanyId } from '@/lib/platformCompanyDb';
import { enforceSameOrigin, withNoStore } from '@/lib/apiSecurity';
import {
  listPlatformUsers,
  parsePlatformRole,
  validateCompanyIds,
} from '@/lib/platformUsers';

function requireAdmin(session: Session | null) {
  const role = (session?.user as { role?: string })?.role;
  if (role !== 'admin') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
  }
  return null;
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const denied = requireAdmin(session);
  if (denied) return denied;

  const { searchParams } = new URL(request.url);
  const role = searchParams.get('role') ?? undefined;
  const includeInactive = searchParams.get('includeInactive') === 'true';

  const users = await listPlatformUsers({ role, includeInactive });
  return withNoStore(NextResponse.json({ users }));
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
    role?: string;
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
  const role = parsePlatformRole(body.role);
  if (!name || !email || !password || password.length < 8) {
    return NextResponse.json(
      { error: 'Nome, e-mail e senha (mín. 8 caracteres) são obrigatórios.' },
      { status: 400 }
    );
  }
  if (!role) {
    return NextResponse.json(
      { error: 'Papel inválido. Use admin ou assistant.' },
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

  let companyIds: string[] = [];
  if (role === 'assistant' && Array.isArray(body.companyIds)) {
    const validated = await validateCompanyIds(body.companyIds);
    if ('error' in validated) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }
    companyIds = validated;
  }

  const restrictToAssignedCompanies =
    role === 'assistant' ? body.restrictToAssignedCompanies !== false : false;

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      phone: body.phone?.trim() || null,
      password: hashedPassword,
      role,
      companyId: platformCompanyId,
      restrictToAssignedCompanies,
      ...(role === 'assistant' && companyIds.length > 0
        ? {
            assistantAssignments: {
              create: companyIds.map((companyId) => ({
                companyId,
                assignedByUserId: adminId ?? null,
              })),
            },
          }
        : {}),
    },
    select: { id: true, email: true, role: true },
  });

  return NextResponse.json(
    { success: true, id: user.id, email: user.email, role: user.role },
    { status: 201 }
  );
}
