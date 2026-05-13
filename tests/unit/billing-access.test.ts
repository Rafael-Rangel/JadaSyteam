import {
  resolveBillingAccess,
  calendarDaysBetweenUtc,
  BILLING_GRACE_DAYS_AFTER_DUE,
  RENEWAL_NOTICE_DAYS_BEFORE,
} from '@/lib/billingAccess';

describe('calendarDaysBetweenUtc', () => {
  it('retorna diferença em dias inteiros UTC', () => {
    const a = new Date('2026-03-10T22:00:00.000Z');
    const b = new Date('2026-03-15T08:00:00.000Z');
    expect(calendarDaysBetweenUtc(a, b)).toBe(5);
  });
});

describe('resolveBillingAccess', () => {
  const base = {
    approvalStatus: 'approved' as const,
    billingManuallyApproved: false as const,
    billingSubscriptionId: 'sub_123',
    billingNextDueDate: new Date('2026-06-01T00:00:00.000Z'),
  };

  it('full quando billing ativo', () => {
    const r = resolveBillingAccess({
      ...base,
      billingStatus: 'active',
      now: new Date('2026-06-05T12:00:00.000Z'),
    });
    expect(r.shellState).toBe('full');
    expect(r.allowBusinessActions).toBe(true);
    expect(r.renewalEligible).toBe(false);
  });

  it('full com aviso de renovação quando vence em até RENEWAL_NOTICE_DAYS_BEFORE dias', () => {
    const r = resolveBillingAccess({
      ...base,
      billingStatus: 'active',
      billingNextDueDate: new Date('2026-06-05T00:00:00.000Z'),
      now: new Date('2026-06-03T12:00:00.000Z'),
    });
    expect(r.shellState).toBe('full');
    expect(r.renewalEligible).toBe(true);
    expect(r.billingNotice?.level).toBe('warning');
  });

  it('grace quando past_due dentro da tolerância', () => {
    const due = new Date('2026-06-01T00:00:00.000Z');
    const r = resolveBillingAccess({
      ...base,
      billingStatus: 'past_due',
      billingNextDueDate: due,
      now: new Date('2026-06-04T12:00:00.000Z'),
    });
    expect(r.shellState).toBe('grace');
    expect(r.allowBusinessActions).toBe(false);
    expect(r.renewalEligible).toBe(true);
    expect(r.graceDaysRemaining).toBeGreaterThan(0);
  });

  it('bloqueado após BILLING_GRACE_DAYS_AFTER_DUE dias de atraso', () => {
    const due = new Date('2026-06-01T00:00:00.000Z');
    const r = resolveBillingAccess({
      ...base,
      billingStatus: 'past_due',
      billingNextDueDate: due,
      now: new Date('2026-06-10T12:00:00.000Z'),
    });
    expect(r.shellState).toBe('blocked');
    expect(r.allowBusinessActions).toBe(false);
    expect(r.renewalEligible).toBe(false);
  });

  it('awaiting quando pendente e vencimento futuro', () => {
    const r = resolveBillingAccess({
      ...base,
      billingStatus: 'pending',
      billingNextDueDate: new Date('2026-12-01T00:00:00.000Z'),
      now: new Date('2026-06-01T12:00:00.000Z'),
    });
    expect(r.shellState).toBe('awaiting');
  });

  it('awaiting quando não aprovado', () => {
    const r = resolveBillingAccess({
      ...base,
      approvalStatus: 'pending',
      billingStatus: 'active',
      now: new Date('2026-06-01T12:00:00.000Z'),
    });
    expect(r.shellState).toBe('awaiting');
    expect(r.allowBusinessActions).toBe(false);
  });

  it('manual aprova ignora billing', () => {
    const r = resolveBillingAccess({
      ...base,
      billingManuallyApproved: true,
      billingStatus: 'pending',
      now: new Date('2026-06-01T12:00:00.000Z'),
    });
    expect(r.shellState).toBe('full');
    expect(r.allowBusinessActions).toBe(true);
  });
});
