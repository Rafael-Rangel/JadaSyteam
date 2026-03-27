import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { planSlugExists } from '@/lib/planService';
import { billingTypeFromInput, createBillingForCompany } from '@/lib/asaasBilling';

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
      approvalStatus: true,
      preferredBillingType: true,
      preferredBillingPeriod: true,
      billingStatus: true,
      billingSubscriptionId: true,
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
  const { plan, verificationStatus, approvalStatus } = body as {
    plan?: string;
    verificationStatus?: string;
    approvalStatus?: string;
  };

  const updates: {
    plan?: string;
    verificationStatus?: string;
    approvalStatus?: string;
    verifiedAt?: Date;
  } = {};
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
  if (approvalStatus === 'approved' || approvalStatus === 'rejected' || approvalStatus === 'pending') {
    updates.approvalStatus = approvalStatus;
  }

  const approvingViaVerification = verificationStatus === 'approved' && !approvalStatus;
  const finalApprovalStatus = approvalStatus ?? (approvingViaVerification ? 'approved' : undefined);
  if (finalApprovalStatus) {
    updates.approvalStatus = finalApprovalStatus;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json(
      { error: 'Nenhuma alteração enviada (plan, verificationStatus ou approvalStatus).' },
      { status: 400 }
    );
  }

  if (updates.approvalStatus === 'approved') {
    const currentCompany = await prisma.company.findUnique({
      where: { id },
      select: {
        id: true,
        approvalStatus: true,
        billingSubscriptionId: true,
        preferredBillingType: true,
        preferredBillingPeriod: true,
      },
    });
    if (!currentCompany) {
      return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 });
    }

    const alreadyHasSubscription = !!currentCompany.billingSubscriptionId;
    const statusWasApproved = currentCompany.approvalStatus === 'approved';
    const needsCreateBilling = !alreadyHasSubscription && !statusWasApproved;

    if (needsCreateBilling) {
      const billingResult = await createBillingForCompany({
        companyId: id,
        billingType: billingTypeFromInput(currentCompany.preferredBillingType || 'BOLETO'),
        period: currentCompany.preferredBillingPeriod || 'monthly',
      });
      if (!billingResult.success) {
        return NextResponse.json(
          {
            error: `A cobrança não foi gerada no Asaas: ${billingResult.error}`,
          },
          { status: billingResult.status }
        );
      }
    }
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
