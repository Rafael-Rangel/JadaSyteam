import type { Session } from 'next-auth';
import { excludePlatformCompanyWhere } from '@/lib/platformCompany';

export type SessionUser = {
  id?: string;
  companyId?: string;
  role?: string;
  companyType?: string;
  actingCompanyId?: string | null;
  actingCompanyType?: string | null;
  restrictToAssignedCompanies?: boolean;
};

export function getSessionUser(session: Session | null): SessionUser | null {
  if (!session?.user) return null;
  return session.user as SessionUser;
}

export function isPlatformRole(role?: string): boolean {
  return role === 'admin' || role === 'assistant';
}

export function isAssistantRole(role?: string): boolean {
  return role === 'assistant';
}

/** Empresa tenant efetiva (cliente em modo assistente). */
export function getEffectiveCompanyId(user: SessionUser): string | null {
  if (!user.companyId) return null;
  if (user.role === 'assistant') {
    return user.actingCompanyId ?? null;
  }
  return user.companyId;
}

export function requireEffectiveCompanyId(
  user: SessionUser
): { ok: true; companyId: string } | { ok: false; status: number; error: string } {
  const companyId = getEffectiveCompanyId(user);
  if (!companyId) {
    return {
      ok: false,
      status: 403,
      error: 'Selecione uma empresa cliente para continuar.',
    };
  }
  return { ok: true, companyId };
}

export async function assertAssistantCanAccessCompany(input: {
  assistantUserId: string;
  companyId: string;
  restrictToAssignedCompanies: boolean;
}): Promise<{ ok: true } | { ok: false; status: number; error: string }> {
  const { prisma } = await import('@/lib/prisma');
  const company = await prisma.company.findFirst({
    where: { id: input.companyId, ...excludePlatformCompanyWhere },
    select: { id: true },
  });
  if (!company) {
    return { ok: false, status: 404, error: 'Empresa não encontrada' };
  }

  if (!input.restrictToAssignedCompanies) {
    return { ok: true };
  }

  const assignment = await prisma.assistantCompanyAssignment.findUnique({
    where: {
      assistantUserId_companyId: {
        assistantUserId: input.assistantUserId,
        companyId: input.companyId,
      },
    },
  });
  if (!assignment) {
    return { ok: false, status: 403, error: 'Empresa não atribuída a este assistente' };
  }
  return { ok: true };
}

export async function resolveTenantAccess(session: Session | null): Promise<
  | {
      ok: true;
      user: SessionUser & { id: string };
      companyId: string;
    }
  | { ok: false; status: number; error: string }
> {
  const user = getSessionUser(session);
  if (!user?.id) {
    return { ok: false, status: 401, error: 'Não autorizado' };
  }

  const effective = requireEffectiveCompanyId(user);
  if (!effective.ok) {
    return effective;
  }

  if (user.role === 'assistant') {
    const access = await assertAssistantCanAccessCompany({
      assistantUserId: user.id,
      companyId: effective.companyId,
      restrictToAssignedCompanies: user.restrictToAssignedCompanies !== false,
    });
    if (!access.ok) {
      return access;
    }
  }

  return {
    ok: true,
    user: user as SessionUser & { id: string },
    companyId: effective.companyId,
  };
}
