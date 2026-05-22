import type { Session } from 'next-auth';
import {
  getEffectiveCompanyId,
  getSessionUser,
  isAssistantRole,
} from '@/lib/sessionContext';

export function resolveLayoutCompanyId(session: Session | null): string | null {
  const user = getSessionUser(session);
  if (!user) return null;
  if (isAssistantRole(user.role)) {
    return getEffectiveCompanyId(user);
  }
  return user.companyId ?? null;
}
