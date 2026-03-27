import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import bcrypt from 'bcryptjs';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getPlanBySlugOrFallback } from '@/lib/planService';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.companyId) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const users = await prisma.user.findMany({
    where: { companyId: session.user.companyId, deletedAt: null },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'asc' },
  });

  return NextResponse.json(users);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.companyId) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const company = await prisma.company.findUnique({
    where: { id: session.user.companyId },
    include: { users: { where: { deletedAt: null } } },
  });
  if (!company) {
    return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 });
  }

  const planData = await getPlanBySlugOrFallback(company.plan);
  if (company.users.length >= planData.usersLimit) {
    return NextResponse.json(
      { error: `Limite de ${planData.usersLimit} usuários do plano ${company.plan}. Faça upgrade para adicionar mais.` },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { name, email, phone, password, role } = body;

    if (!name?.trim() || !email?.trim() || !password) {
      return NextResponse.json(
        { error: 'Nome, e-mail e senha são obrigatórios.' },
        { status: 400 }
      );
    }
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Senha deve ter no mínimo 8 caracteres.' },
        { status: 400 }
      );
    }

    const validRoles = ['manager', 'employee'];
    const finalRole = validRoles.includes(role) ? role : 'employee';

    const emailNorm = (email as string).trim().toLowerCase();
    const existing = await prisma.user.findUnique({
      where: { email: emailNorm },
    });
    if (existing) {
      return NextResponse.json(
        { error: 'Já existe uma conta com este e-mail.' },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    await prisma.user.create({
      data: {
        name: (name as string).trim(),
        email: emailNorm,
        phone: (phone as string)?.trim() || null,
        password: hashedPassword,
        role: finalRole,
        companyId: session.user.companyId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('Create user error:', e);
    return NextResponse.json({ error: 'Erro ao criar usuário.' }, { status: 500 });
  }
}
