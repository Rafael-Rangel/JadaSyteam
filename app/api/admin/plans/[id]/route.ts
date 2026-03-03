import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string })?.role;
  if (role !== 'admin') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
  }

  const { id } = await params;
  const plan = await prisma.plan.findUnique({
    where: { id },
  });
  if (!plan) {
    return NextResponse.json({ error: 'Plano não encontrado.' }, { status: 404 });
  }

  return NextResponse.json({
    id: plan.id,
    slug: plan.slug,
    name: plan.name,
    price: plan.price,
    usersLimit: plan.usersLimit,
    requestsPerMonthLimit: plan.requestsPerMonthLimit,
    proposalsPerMonthLimit: plan.proposalsPerMonthLimit,
    description: plan.description ?? '',
    features: Array.isArray(plan.features) ? plan.features : [],
    popular: plan.popular,
    active: plan.active,
    sortOrder: plan.sortOrder,
  });
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
  let body: {
    name?: string;
    price?: number;
    usersLimit?: number;
    requestsPerMonthLimit?: number;
    proposalsPerMonthLimit?: number;
    description?: string;
    features?: string[];
    popular?: boolean;
    active?: boolean;
    sortOrder?: number;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Body JSON inválido.' }, { status: 400 });
  }

  const existing = await prisma.plan.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: 'Plano não encontrado.' }, { status: 404 });
  }

  const data: {
    name?: string;
    price?: number;
    usersLimit?: number;
    requestsPerMonthLimit?: number;
    proposalsPerMonthLimit?: number;
    description?: string | null;
    features?: string[];
    popular?: boolean;
    active?: boolean;
    sortOrder?: number;
  } = {};

  if (typeof body.name === 'string') data.name = body.name.trim();
  if (typeof body.price === 'number' && body.price >= 0) data.price = body.price;
  if (typeof body.usersLimit === 'number' && body.usersLimit >= 0)
    data.usersLimit = body.usersLimit;
  if (typeof body.requestsPerMonthLimit === 'number' && body.requestsPerMonthLimit >= 0)
    data.requestsPerMonthLimit = body.requestsPerMonthLimit;
  if (typeof body.proposalsPerMonthLimit === 'number' && body.proposalsPerMonthLimit >= 0)
    data.proposalsPerMonthLimit = body.proposalsPerMonthLimit;
  if (body.description !== undefined)
    data.description = typeof body.description === 'string' ? body.description.trim() || null : null;
  if (Array.isArray(body.features))
    data.features = body.features.filter((x): x is string => typeof x === 'string');
  if (typeof body.popular === 'boolean') data.popular = body.popular;
  if (typeof body.active === 'boolean') data.active = body.active;
  if (typeof body.sortOrder === 'number') data.sortOrder = body.sortOrder;

  const plan = await prisma.plan.update({
    where: { id },
    data,
  });

  return NextResponse.json({
    id: plan.id,
    slug: plan.slug,
    name: plan.name,
    price: plan.price,
    usersLimit: plan.usersLimit,
    requestsPerMonthLimit: plan.requestsPerMonthLimit,
    proposalsPerMonthLimit: plan.proposalsPerMonthLimit,
    description: plan.description ?? '',
    features: Array.isArray(plan.features) ? plan.features : [],
    popular: plan.popular,
    active: plan.active,
    sortOrder: plan.sortOrder,
  });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string })?.role;
  if (role !== 'admin') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
  }

  const { id } = await params;
  const plan = await prisma.plan.findUnique({ where: { id } });
  if (!plan) {
    return NextResponse.json({ error: 'Plano não encontrado.' }, { status: 404 });
  }

  const companiesWithPlan = await prisma.company.count({
    where: { plan: plan.slug },
  });
  if (companiesWithPlan > 0) {
    return NextResponse.json(
      {
        error: `Não é possível excluir: ${companiesWithPlan} empresa(s) usam este plano. Desative o plano em vez de excluir.`,
      },
      { status: 400 }
    );
  }

  await prisma.plan.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
