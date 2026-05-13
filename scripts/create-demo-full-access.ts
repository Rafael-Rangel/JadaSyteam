/**
 * Conta de demonstração: plano Enterprise, empresa aprovada, cobrança ativa (dados mockados).
 * Uso: npm run create-demo-user
 * Variáveis opcionais: DEMO_FULL_EMAIL, DEMO_FULL_PASSWORD
 */

import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';

const EMAIL = (process.env.DEMO_FULL_EMAIL || 'demo-completo@jada.com.br').trim().toLowerCase();
const PASSWORD = process.env.DEMO_FULL_PASSWORD || 'JadaDemo2025!';
const CNPJ = '55666777000188';

async function ensurePlanEnterprise() {
  const slug = 'enterprise';
  const existing = await prisma.plan.findUnique({ where: { slug } });
  if (existing) return;
  await prisma.plan.create({
    data: {
      slug,
      name: 'Enterprise',
      price: 799,
      usersLimit: 100,
      requestsPerMonthLimit: 1000,
      proposalsPerMonthLimit: 2000,
      active: true,
      sortOrder: 3,
    },
  });
}

async function main() {
  await ensurePlanEnterprise();

  const hashed = await bcrypt.hash(PASSWORD, 12);
  const now = new Date();
  const nextDue = new Date(now);
  nextDue.setMonth(nextDue.getMonth() + 1);

  const companyData = {
    name: 'Demo Completo LTDA',
    cnpj: CNPJ,
    type: 'both' as const,
    plan: 'enterprise',
    approvalStatus: 'approved',
    verificationStatus: 'approved',
    verifiedAt: now,
    billingStatus: 'active' as const,
    billingManuallyApproved: false,
    billingProvider: 'asaas',
    billingCustomerId: 'cus_demo_mock_jada',
    billingSubscriptionId: 'sub_demo_mock_jada',
    billingCycle: 'MONTHLY',
    billingNextDueDate: nextDue,
    billingLastEventAt: now,
    preferredBillingType: 'CREDIT_CARD',
    preferredBillingPeriod: 'monthly',
    riskLevel: 'low',
    address: 'Av. Paulista, 1000',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '01310100',
    description: 'Empresa fictícia para testes manuais da plataforma.',
  };

  const existing = await prisma.user.findUnique({
    where: { email: EMAIL },
    select: { id: true, companyId: true },
  });

  const company = existing
    ? await prisma.company.update({
        where: { id: existing.companyId },
        data: companyData,
      })
    : await prisma.company.create({ data: companyData });

  await prisma.user.upsert({
    where: { email: EMAIL },
    update: {
      name: 'Usuário Demo Completo',
      password: hashed,
      role: 'owner',
      companyId: company.id,
      phone: '(11) 98888-7777',
      deletedAt: null,
    },
    create: {
      email: EMAIL,
      name: 'Usuário Demo Completo',
      password: hashed,
      role: 'owner',
      companyId: company.id,
      phone: '(11) 98888-7777',
    },
  });

  console.log('');
  console.log('Conta demo criada/atualizada com sucesso.');
  console.log('---');
  console.log(`E-mail:    ${EMAIL}`);
  console.log(`Senha:     ${PASSWORD}`);
  console.log(`Plano:     enterprise (mock)`);
  console.log(`Empresa:   ${companyData.name} · CNPJ ${CNPJ}`);
  console.log(`Acesso:    aprovação OK · cobrança ativa (IDs Asaas mockados)`);
  console.log('---');
  console.log('Login em /login — tipo "both" redireciona ao painel comprador; use o menu para área vendedor.');
  console.log('');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
