import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';

type AccountSeed = {
  email: string;
  password: string;
  name: string;
  role: 'owner' | 'admin';
  companyName: string;
  companyType: 'buyer' | 'seller' | 'both';
  cnpj: string;
  plan: string;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  verificationStatus: 'pending' | 'approved' | 'rejected';
  billingStatus: 'pending' | 'active' | 'past_due' | 'canceled';
  billingManuallyApproved: boolean;
};

function env(name: string, fallback: string): string {
  return (process.env[name] || fallback).trim();
}

const accounts: AccountSeed[] = [
  {
    email: env('TEST_BUYER_EMAIL', 'buyer-e2e@jada.com.br'),
    password: env('TEST_BUYER_PASSWORD', 'Senha@TestBuyer1'),
    name: 'Buyer E2E',
    role: 'owner',
    companyName: 'Buyer E2E LTDA',
    companyType: 'buyer',
    cnpj: '11222333000181',
    plan: 'starter',
    approvalStatus: 'approved',
    verificationStatus: 'approved',
    billingStatus: 'active',
    billingManuallyApproved: false,
  },
  {
    email: env('TEST_SELLER_EMAIL', 'seller-e2e@jada.com.br'),
    password: env('TEST_SELLER_PASSWORD', 'Senha@TestSeller1'),
    name: 'Seller E2E',
    role: 'owner',
    companyName: 'Seller E2E LTDA',
    companyType: 'seller',
    cnpj: '33444555000166',
    plan: 'starter',
    approvalStatus: 'approved',
    verificationStatus: 'approved',
    billingStatus: 'active',
    billingManuallyApproved: false,
  },
  {
    email: env('TEST_ADMIN_EMAIL', 'admin-e2e@jada.com.br'),
    password: env('TEST_ADMIN_PASSWORD', 'Senha@TestAdmin1'),
    name: 'Admin E2E',
    role: 'admin',
    companyName: 'Admin E2E LTDA',
    companyType: 'both',
    cnpj: '77888999000110',
    plan: 'enterprise',
    approvalStatus: 'approved',
    verificationStatus: 'approved',
    billingStatus: 'active',
    billingManuallyApproved: true,
  },
  {
    email: 'pending-buyer@test.com',
    password: 'Senha@1234',
    name: 'Pending Buyer',
    role: 'owner',
    companyName: 'Pending Buyer LTDA',
    companyType: 'buyer',
    cnpj: '99111222000133',
    plan: 'starter',
    approvalStatus: 'pending',
    verificationStatus: 'pending',
    billingStatus: 'pending',
    billingManuallyApproved: false,
  },
  {
    email: 'pending-seller@test.com',
    password: 'Senha@1234',
    name: 'Pending Seller',
    role: 'owner',
    companyName: 'Pending Seller LTDA',
    companyType: 'seller',
    cnpj: '44111555000190',
    plan: 'starter',
    approvalStatus: 'pending',
    verificationStatus: 'pending',
    billingStatus: 'pending',
    billingManuallyApproved: false,
  },
];

async function ensurePlan(slug: string) {
  const existing = await prisma.plan.findUnique({ where: { slug } });
  if (existing) return;
  await prisma.plan.create({
    data: {
      slug,
      name: slug === 'enterprise' ? 'Enterprise' : slug === 'growth' ? 'Growth' : 'Starter',
      price: slug === 'enterprise' ? 799 : slug === 'growth' ? 199 : 49,
      usersLimit: slug === 'enterprise' ? 100 : slug === 'growth' ? 20 : 5,
      requestsPerMonthLimit: slug === 'enterprise' ? 1000 : slug === 'growth' ? 250 : 50,
      proposalsPerMonthLimit: slug === 'enterprise' ? 2000 : slug === 'growth' ? 600 : 100,
      active: true,
      sortOrder: slug === 'starter' ? 1 : slug === 'growth' ? 2 : 3,
    },
  });
}

async function upsertAccount(seed: AccountSeed) {
  const hashed = await bcrypt.hash(seed.password, 12);

  const existingUser = await prisma.user.findUnique({
    where: { email: seed.email.toLowerCase() },
    select: { id: true, companyId: true },
  });

  const company = existingUser
    ? await prisma.company.update({
        where: { id: existingUser.companyId },
        data: {
          name: seed.companyName,
          cnpj: seed.cnpj,
          type: seed.companyType,
          plan: seed.plan,
          approvalStatus: seed.approvalStatus,
          verificationStatus: seed.verificationStatus,
          billingStatus: seed.billingStatus,
          billingManuallyApproved: seed.billingManuallyApproved,
        },
      })
    : await prisma.company.create({
        data: {
          name: seed.companyName,
          cnpj: seed.cnpj,
          type: seed.companyType,
          plan: seed.plan,
          approvalStatus: seed.approvalStatus,
          verificationStatus: seed.verificationStatus,
          billingStatus: seed.billingStatus,
          billingManuallyApproved: seed.billingManuallyApproved,
        },
      });

  await prisma.user.upsert({
    where: { email: seed.email.toLowerCase() },
    update: {
      name: seed.name,
      password: hashed,
      role: seed.role,
      companyId: company.id,
      deletedAt: null,
    },
    create: {
      email: seed.email.toLowerCase(),
      password: hashed,
      name: seed.name,
      role: seed.role,
      companyId: company.id,
    },
  });
}

async function main() {
  await ensurePlan('starter');
  await ensurePlan('growth');
  await ensurePlan('enterprise');

  for (const account of accounts) {
    await upsertAccount(account);
  }

  console.log(`E2E accounts ready: ${accounts.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
