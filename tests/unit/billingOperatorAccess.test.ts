import { canManageBillingOperations } from '@/lib/billingOperatorAccess';
import { resolveBillingAccess } from '@/lib/billingAccess';

describe('billingOperatorAccess', () => {
  const pendingAccess = resolveBillingAccess({
    approvalStatus: 'approved',
    billingStatus: 'pending',
    billingManuallyApproved: false,
    billingSubscriptionId: 'sub_1',
    billingNextDueDate: new Date('2030-01-15'),
  });

  it('assistente pode operar cobrança mesmo fora da janela de renovação', () => {
    expect(canManageBillingOperations('assistant', pendingAccess)).toBe(true);
  });

  it('owner com pagamento pendente não opera fora da janela', () => {
    expect(canManageBillingOperations('owner', pendingAccess)).toBe(false);
  });
});
