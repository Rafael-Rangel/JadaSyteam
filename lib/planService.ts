import { prisma } from '@/lib/prisma';
import {
  getPlanLimits as getFallbackLimits,
  getPlanName as getFallbackName,
  getPlanPrice as getFallbackPrice,
  getPlanDescription as getFallbackDescription,
  getPlanFeatures as getFallbackFeatures,
} from '@/lib/plans';

export type PlanData = {
  id: string;
  slug: string;
  name: string;
  price: number;
  usersLimit: number;
  requestsPerMonthLimit: number;
  proposalsPerMonthLimit: number;
  description: string;
  features: string[];
  popular: boolean;
  active: boolean;
  sortOrder: number;
};

export type PlanLimits = {
  name: string;
  price: number;
  usersLimit: number;
  requestsPerMonthLimit: number;
  proposalsPerMonthLimit: number;
  description: string;
  features: string[];
  popular: boolean;
};

function parseFeatures(features: unknown): string[] {
  if (Array.isArray(features)) {
    return features.filter((x): x is string => typeof x === 'string');
  }
  return [];
}

/**
 * Retorna um plano por slug ou null. Usar fallback (lib/plans) no caller se null.
 */
export async function getPlanBySlug(slug: string): Promise<PlanLimits | null> {
  if (!slug?.trim()) return null;
  const plan = await prisma.plan.findUnique({
    where: { slug: slug.trim().toLowerCase() },
  });
  if (!plan) return null;
  return {
    name: plan.name,
    price: plan.price,
    usersLimit: plan.usersLimit,
    requestsPerMonthLimit: plan.requestsPerMonthLimit,
    proposalsPerMonthLimit: plan.proposalsPerMonthLimit,
    description: plan.description ?? '',
    features: parseFeatures(plan.features),
    popular: plan.popular,
  };
}

/**
 * Retorna dados do plano por slug; se não existir no banco, retorna fallback de lib/plans.
 */
export async function getPlanBySlugOrFallback(slug: string): Promise<PlanLimits> {
  const fromDb = await getPlanBySlug(slug);
  if (fromDb) return fromDb;
  const limits = getFallbackLimits(slug);
  return {
    name: getFallbackName(slug),
    price: getFallbackPrice(slug),
    usersLimit: limits.users,
    requestsPerMonthLimit: limits.requestsPerMonth,
    proposalsPerMonthLimit: limits.proposalsPerMonth,
    description: getFallbackDescription(slug),
    features: getFallbackFeatures(slug),
    popular: false,
  };
}

/**
 * Lista todos os planos (admin), ordenados por sortOrder e slug.
 */
export async function getAllPlans(): Promise<PlanData[]> {
  const rows = await prisma.plan.findMany({
    orderBy: [{ sortOrder: 'asc' }, { slug: 'asc' }],
  });
  return rows.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    price: p.price,
    usersLimit: p.usersLimit,
    requestsPerMonthLimit: p.requestsPerMonthLimit,
    proposalsPerMonthLimit: p.proposalsPerMonthLimit,
    description: p.description ?? '',
    features: parseFeatures(p.features),
    popular: p.popular,
    active: p.active,
    sortOrder: p.sortOrder,
  }));
}

/**
 * Lista planos ativos (página pública e signup), ordenados por sortOrder e slug.
 */
export async function getActivePlans(): Promise<PlanData[]> {
  const rows = await prisma.plan.findMany({
    where: { active: true },
    orderBy: [{ sortOrder: 'asc' }, { slug: 'asc' }],
  });
  return rows.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    price: p.price,
    usersLimit: p.usersLimit,
    requestsPerMonthLimit: p.requestsPerMonthLimit,
    proposalsPerMonthLimit: p.proposalsPerMonthLimit,
    description: p.description ?? '',
    features: parseFeatures(p.features),
    popular: p.popular,
    active: p.active,
    sortOrder: p.sortOrder,
  }));
}

/**
 * Verifica se um slug existe na tabela Plan (para validação em signup/companies).
 */
export async function planSlugExists(slug: string): Promise<boolean> {
  if (!slug?.trim()) return false;
  const count = await prisma.plan.count({
    where: { slug: slug.trim().toLowerCase() },
  });
  return count > 0;
}

/**
 * Verifica se um slug existe e está ativo (para signup).
 */
export async function planSlugExistsAndActive(slug: string): Promise<boolean> {
  if (!slug?.trim()) return false;
  const plan = await prisma.plan.findUnique({
    where: { slug: slug.trim().toLowerCase() },
    select: { active: true },
  });
  return plan?.active ?? false;
}
