import type { BillingAccessResult } from '@/lib/billingAccess';
import { isRenewalWindowOpen } from '@/lib/billingAccess';

/** Assistente em modo suporte pode operar cobrança fora da janela de renovação. */
export function canManageBillingOperations(
  role: string | null | undefined,
  access: BillingAccessResult
): boolean {
  if (role === 'assistant') return true;
  return isRenewalWindowOpen(access);
}
