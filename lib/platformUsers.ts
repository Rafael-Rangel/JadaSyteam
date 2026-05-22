import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { PLATFORM_COMPANY_CNPJ, excludePlatformCompanyWhere } from '@/lib/platformCompany';
import { getPlatformCompanyId } from '@/lib/platformCompanyDb';

export const PLATFORM_ROLES = ['admin', 'assistant'] as const;
export type PlatformRole = (typeof PLATFORM_ROLES)[number];

export type PlatformUserPermissions = {
  canAccessAdmin: boolean;
  canAccessAssistantHub: boolean;
  canManageClientOperations: boolean;
  restrictToAssignedCompanies: boolean;
};

export function permissionsForRole(
  role: PlatformRole,
  restrictToAssignedCompanies: boolean
): PlatformUserPermissions {
  if (role === 'admin') {
    return {
      canAccessAdmin: true,
      canAccessAssistantHub: false,
      canManageClientOperations: false,
      restrictToAssignedCompanies: false,
    };
  }
  return {
    canAccessAdmin: false,
    canAccessAssistantHub: true,
    canManageClientOperations: true,
    restrictToAssignedCompanies,
  };
}

const userSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  role: true,
  restrictToAssignedCompanies: true,
  createdAt: true,
  deletedAt: true,
  assistantAssignments: {
    include: {
      company: { select: { id: true, name: true, type: true } },
    },
  },
} satisfies Prisma.UserSelect;

export function serializePlatformUser(
  user: Prisma.UserGetPayload<{ select: typeof userSelect }>
) {
  const role = user.role as PlatformRole;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role,
    restrictToAssignedCompanies: user.restrictToAssignedCompanies,
    active: user.deletedAt == null,
    createdAt: user.createdAt.toISOString(),
    deletedAt: user.deletedAt?.toISOString() ?? null,
    assignments: user.assistantAssignments.map((x) => ({
      companyId: x.company.id,
      companyName: x.company.name,
      companyType: x.company.type,
    })),
    permissions: permissionsForRole(role, user.restrictToAssignedCompanies),
  };
}

export async function listPlatformUsers(filter?: { role?: string; includeInactive?: boolean }) {
  const company = await prisma.company.findFirst({
    where: { cnpj: PLATFORM_COMPANY_CNPJ },
    select: { id: true },
  });
  if (!company) return [];

  const where: Prisma.UserWhereInput = {
    companyId: company.id,
    role: { in: [...PLATFORM_ROLES] },
  };
  if (filter?.role === 'admin' || filter?.role === 'assistant') {
    where.role = filter.role;
  }
  if (!filter?.includeInactive) {
    where.deletedAt = null;
  }

  const users = await prisma.user.findMany({
    where,
    select: userSelect,
    orderBy: [{ role: 'asc' }, { name: 'asc' }],
  });
  return users.map(serializePlatformUser);
}

export async function getPlatformUserById(id: string) {
  const company = await prisma.company.findFirst({
    where: { cnpj: PLATFORM_COMPANY_CNPJ },
    select: { id: true },
  });
  if (!company) return null;

  const user = await prisma.user.findFirst({
    where: {
      id,
      companyId: company.id,
      role: { in: [...PLATFORM_ROLES] },
    },
    select: userSelect,
  });
  if (!user) return null;
  return serializePlatformUser(user);
}

export async function countActiveAdmins(excludeUserId?: string) {
  const companyId = await getPlatformCompanyId();
  if (!companyId) return 0;
  return prisma.user.count({
    where: {
      companyId,
      role: 'admin',
      deletedAt: null,
      ...(excludeUserId ? { id: { not: excludeUserId } } : {}),
    },
  });
}

export async function validateCompanyIds(companyIds: string[]): Promise<string[] | { error: string }> {
  const unique = [...new Set(companyIds.filter((id) => typeof id === 'string' && id.length > 0))];
  if (unique.length === 0) return [];
  const count = await prisma.company.count({
    where: { id: { in: unique }, ...excludePlatformCompanyWhere },
  });
  if (count !== unique.length) {
    return { error: 'Uma ou mais empresas cliente são inválidas.' };
  }
  return unique;
}

export function parsePlatformRole(value: unknown): PlatformRole | null {
  return value === 'admin' || value === 'assistant' ? value : null;
}
