import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getAllPlans } from '@/lib/planService';

export async function GET() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string })?.role;
  if (role !== 'admin') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
  }

  const plans = await getAllPlans();
  return NextResponse.json(plans);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string })?.role;
  if (role !== 'admin') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
  }

  let body: {
    slug?: string;
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

  const slug = typeof body.slug === 'string' ? body.slug.trim().toLowerCase() : '';
  if (!slug) {
    return NextResponse.json({ error: 'Slug é obrigatório.' }, { status: 400 });
  }
  if (!/^[a-z0-9-_]+$/.test(slug)) {
    return NextResponse.json(
      { error: 'Slug deve conter apenas letras minúsculas, números, hífen e underscore.' },
      { status: 400 }
    );
  }

  const existing = await prisma.plan.findUnique({ where: { slug } });
  if (existing) {
    return NextResponse.json({ error: 'Já existe um plano com este slug.' }, { status: 409 });
  }

  const name = typeof body.name === 'string' ? body.name.trim() : slug;
  const price = typeof body.price === 'number' && body.price >= 0 ? body.price : 0;
  const usersLimit = typeof body.usersLimit === 'number' && body.usersLimit >= 0 ? body.usersLimit : 0;
  const requestsPerMonthLimit =
    typeof body.requestsPerMonthLimit === 'number' && body.requestsPerMonthLimit >= 0
      ? body.requestsPerMonthLimit
      : 0;
  const proposalsPerMonthLimit =
    typeof body.proposalsPerMonthLimit === 'number' && body.proposalsPerMonthLimit >= 0
      ? body.proposalsPerMonthLimit
      : 0;
  const description =
    typeof body.description === 'string' ? body.description.trim() || null : null;
  const features = Array.isArray(body.features)
    ? body.features.filter((x): x is string => typeof x === 'string')
    : [];
  const popular = body.popular === true;
  const active = body.active !== false;
  const sortOrder = typeof body.sortOrder === 'number' ? body.sortOrder : 0;

  const plan = await prisma.plan.create({
    data: {
      slug,
      name,
      price,
      usersLimit,
      requestsPerMonthLimit,
      proposalsPerMonthLimit,
      description,
      features,
      popular,
      active,
      sortOrder,
    },
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
