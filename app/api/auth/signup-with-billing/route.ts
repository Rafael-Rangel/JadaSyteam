/**
 * Cadastro inicial: cria Company + User e salva preferência de cobrança.
 * Não gera assinatura no Asaas neste momento; a cobrança é criada quando o admin aprova a empresa.
 */
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { planSlugExistsAndActive } from '@/lib/planService';
import {
  normalizeCnpj,
  isValidCnpjFormat,
  verifyCnpjWithBrasilApi,
} from '@/lib/cnpjVerification';
import { billingTypeFromInput } from '@/lib/asaasBilling';
import { getRequestRateKey, rateLimitByKey } from '@/lib/rateLimit';

export async function POST(request: Request) {
  try {
    const limiter = rateLimitByKey(`signup-billing:${getRequestRateKey(request)}`, 10, 60_000);
    if (!limiter.allowed) {
      return NextResponse.json(
        { error: 'Muitas tentativas de cadastro. Tente novamente em instantes.' },
        { status: 429 }
      );
    }
    const body = await request.json();
    const {
      companyName,
      cnpj,
      companyType,
      ownerName,
      email,
      phone,
      password,
      plan,
      billingType: billingTypeRaw,
      period,
    } = body;

    if (!companyName?.trim() || !companyType || !ownerName?.trim() || !email?.trim() || !password) {
      return NextResponse.json(
        { error: 'Dados obrigatórios faltando (empresa, tipo, nome, e-mail, senha).' },
        { status: 400 }
      );
    }
    if (!['buyer', 'seller', 'both'].includes(String(companyType))) {
      return NextResponse.json(
        { error: 'Tipo de empresa inválido. Use buyer, seller ou both.' },
        { status: 400 }
      );
    }

    const cnpjRaw = typeof cnpj === 'string' ? cnpj.trim() : '';
    if (!cnpjRaw) {
      return NextResponse.json({ error: 'CNPJ é obrigatório.' }, { status: 400 });
    }
    if (!isValidCnpjFormat(cnpjRaw)) {
      return NextResponse.json(
        { error: 'CNPJ inválido. Informe 14 dígitos (com ou sem formatação).' },
        { status: 400 }
      );
    }
    const cnpjNormalized = normalizeCnpj(cnpjRaw);

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Senha deve ter no mínimo 8 caracteres.' },
        { status: 400 }
      );
    }

    const planSlug = typeof plan === 'string' ? plan.trim() : '';
    const validPlan =
      planSlug && (await planSlugExistsAndActive(planSlug)) ? planSlug : 'starter';

    const billingType = billingTypeFromInput(
      typeof billingTypeRaw === 'string' ? billingTypeRaw : 'BOLETO'
    );
    const periodStr = typeof period === 'string' ? period : 'monthly';
    const normalizedPeriod =
      periodStr === 'semiannually' || periodStr === 'yearly' ? periodStr : 'monthly';

    const existing = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });
    if (existing) {
      return NextResponse.json(
        { error: 'Já existe uma conta com este e-mail.' },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const company = await prisma.company.create({
      data: {
        name: companyName.trim(),
        cnpj: cnpjNormalized,
        type: companyType,
        plan: validPlan,
        preferredBillingType: billingType,
        preferredBillingPeriod: normalizedPeriod,
        approvalStatus: 'pending',
        billingStatus: null,
        verificationStatus: 'pending',
      },
    });

    const verification = await verifyCnpjWithBrasilApi(cnpjNormalized);
    const now = new Date();
    await prisma.company.update({
      where: { id: company.id },
      data: {
        verificationStatus: verification.status,
        verifiedAt: now,
        verificationPayload: verification.raw
          ? (verification.raw as unknown as object)
          : undefined,
      },
    });

    await prisma.user.create({
      data: {
        email: email.trim().toLowerCase(),
        password: hashedPassword,
        name: ownerName.trim(),
        phone: phone?.trim() || null,
        role: 'owner',
        companyId: company.id,
      },
    });

    return NextResponse.json({
      success: true,
      message:
        'Conta criada com sucesso. Sua empresa está em análise e você será avisado na plataforma quando estiver liberada para pagamento.',
      awaitingApproval: true,
    });
  } catch (e) {
    console.error('Signup with billing error:', e);
    return NextResponse.json(
      { error: 'Erro ao criar conta. Tente novamente.' },
      { status: 500 }
    );
  }
}
