import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

export type AssistantAuditAction =
  | 'enter_company'
  | 'leave_company'
  | 'billing_support_bypass'
  | 'billing_support_issue_payment'
  | 'billing_support_change_method'
  | 'api_denied';

export async function logAssistantAction(input: {
  assistantUserId: string;
  companyId?: string | null;
  action: AssistantAuditAction;
  metadata?: Record<string, unknown>;
}) {
  await prisma.assistantAuditLog.create({
    data: {
      assistantUserId: input.assistantUserId,
      companyId: input.companyId ?? null,
      action: input.action,
      metadata: (input.metadata ?? undefined) as Prisma.InputJsonValue | undefined,
    },
  });
}
