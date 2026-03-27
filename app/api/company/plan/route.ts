import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getPlanBySlugOrFallback, planSlugExistsAndActive } from '@/lib/planService';
import { asaasUpdateSubscription } from '@/lib/asaas';
import { cycleFromPeriod } from '@/lib/asaasBilling';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.companyId) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const body = await request.json().catch(() => ({} as Record<string, unknown>));
  const planSlug = typeof body.planSlug === 'string' ? body.planSlug.trim() : '';
  if (!planSlug) {
    return NextResponse.json({ error: 'planSlug é obrigatório.' }, { status: 400 });
  }

  const exists = await planSlugExistsAndActive(planSlug);
  if (!exists) {
    return NextResponse.json({ error: 'Plano inválido ou inativo.' }, { status: 404 });
  }

  const company = await prisma.company.findUnique({
    where: { id: session.user.companyId },
    include: { users: true },
  });
  if (!company) {
    return NextResponse.json({ error: 'Empresa não encontrada.' }, { status: 404 });
  }
  if (company.plan === planSlug) {
    return NextResponse.json({ error: 'Sua empresa já está nesse plano.' }, { status: 400 });
  }

  const targetPlan = await getPlanBySlugOrFallback(planSlug);
  if (company.users.length > targetPlan.usersLimit) {
    return NextResponse.json(
      {
        error: `Downgrade não permitido: empresa tem ${company.users.length} usuário(s), mas o plano suporta ${targetPlan.usersLimit}.`,
      },
      { status: 400 }
    );
  }

  // Atualiza assinatura no Asaas quando já existe subscription.
  if (company.billingSubscriptionId) {
    const period = company.preferredBillingPeriod || 'monthly';
    const cycle = cycleFromPeriod(period);
    const base = targetPlan.price ?? 0;
    const value = cycle === 'YEARLY' ? base * 12 : cycle === 'SEMIANNUALLY' ? base * 6 : base;
    try {
      await asaasUpdateSubscription(company.billingSubscriptionId, {
        value,
        cycle,
        description: `JADA - ${targetPlan.name} (${cycle})`,
      });
    } catch {
      return NextResponse.json(
        { error: 'Falha ao atualizar assinatura no provedor de pagamento.' },
        { status: 502 }
      );
    }
  }

  const updated = await prisma.company.update({
    where: { id: company.id },
    data: { plan: planSlug },
    select: { id: true, plan: true },
  });

  return NextResponse.json({ success: true, company: updated });
}
