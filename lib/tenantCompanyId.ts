import type { Session } from 'next-auth';
import { resolveTenantAccess } from '@/lib/sessionContext';

/** Resolve companyId do tenant para rotas API (inclui assistente em modo cliente). */
export async function getTenantCompanyIdFromSession(session: Session | null) {
  return resolveTenantAccess(session);
}
