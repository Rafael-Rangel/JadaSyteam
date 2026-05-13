/**
 * Regras de acesso ao painel (grace 7d após vencimento) e janela de renovação / troca de plano.
 * Datas em UTC (início do dia) para evitar surpresas com fuso.
 */

export const BILLING_GRACE_DAYS_AFTER_DUE = 7;
export const RENEWAL_NOTICE_DAYS_BEFORE = 7;

export type BillingShellState = 'full' | 'grace' | 'awaiting' | 'blocked';

export type BillingNoticeLevel = 'info' | 'warning' | 'danger';

export type BillingAccessResult = {
  shellState: BillingShellState;
  allowBusinessActions: boolean;
  /** Pode chamar POST /subscription/renew ou mudar plano na UI. */
  renewalEligible: boolean;
  billingNotice: { level: BillingNoticeLevel; message: string } | null;
  /** Dias restantes de tolerância após vencimento (1–7), ou null. */
  graceDaysRemaining: number | null;
};

function startOfUtcDay(d: Date): number {
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

/** Dias completos entre o dia de `from` e o dia de `to` (UTC). Pode ser negativo se `to` é antes. */
export function calendarDaysBetweenUtc(from: Date, to: Date): number {
  return Math.floor((startOfUtcDay(to) - startOfUtcDay(from)) / 86400_000);
}

export type BillingAccessInput = {
  approvalStatus: string | null | undefined;
  billingStatus: string | null | undefined;
  billingManuallyApproved: boolean | null | undefined;
  billingSubscriptionId: string | null | undefined;
  billingNextDueDate: Date | null | undefined;
  /** Relógio injetável para testes */
  now?: Date;
};

export function resolveBillingAccess(input: BillingAccessInput): BillingAccessResult {
  const now = input.now ?? new Date();
  const approved = input.approvalStatus === 'approved';
  const manual = input.billingManuallyApproved === true;
  const active = input.billingStatus === 'active';
  const subscriptionId = input.billingSubscriptionId?.trim();

  const nullNotice: BillingAccessResult = {
    shellState: 'awaiting',
    allowBusinessActions: false,
    renewalEligible: false,
    billingNotice: null,
    graceDaysRemaining: null,
  };

  if (!approved) {
    return {
      ...nullNotice,
      shellState: 'awaiting',
      billingNotice: {
        level: 'info',
        message: 'Seu cadastro ainda não foi aprovado para acesso ao painel.',
      },
    };
  }

  if (manual || active) {
    const nextDue = input.billingNextDueDate ?? null;
    let renewalEligible = false;
    let notice: BillingAccessResult['billingNotice'] = null;

    if (nextDue) {
      const daysUntilDue = calendarDaysBetweenUtc(now, nextDue);
      if (daysUntilDue >= 0 && daysUntilDue <= RENEWAL_NOTICE_DAYS_BEFORE) {
        renewalEligible = true;
        notice = {
          level: daysUntilDue <= 3 ? 'warning' : 'info',
          message:
            daysUntilDue === 0
              ? 'Sua assinatura vence hoje. Renove ou ajuste o plano em Assinatura.'
              : `Renovação em ${daysUntilDue} dia(s). Você pode revisar o plano em Assinatura.`,
        };
      }
    }

    return {
      shellState: 'full',
      allowBusinessActions: true,
      renewalEligible,
      billingNotice: notice,
      graceDaysRemaining: null,
    };
  }

  if (!subscriptionId) {
    return {
      ...nullNotice,
      shellState: 'awaiting',
      billingNotice: {
        level: 'info',
        message: 'Aguardando emissão da cobrança. Acompanhe em Aguardando pagamento.',
      },
    };
  }

  const due = input.billingNextDueDate;
  if (!due) {
    return {
      shellState: 'blocked',
      allowBusinessActions: false,
      renewalEligible: false,
      billingNotice: {
        level: 'danger',
        message: 'Não foi possível determinar o vencimento. Entre em contato com o suporte.',
      },
      graceDaysRemaining: null,
    };
  }

  const daysSinceDue = calendarDaysBetweenUtc(due, now);
  /** Atraso: past_due (inclui dia do vencimento) ou pendente com pelo menos 1 dia após o vencimento. */
  const inOverdueState =
    input.billingStatus === 'past_due' || (input.billingStatus === 'pending' && daysSinceDue >= 1);

  const stillOnTime = input.billingStatus === 'pending' && daysSinceDue <= 0;

  if (stillOnTime || !inOverdueState) {
    return {
      ...nullNotice,
      shellState: 'awaiting',
      billingNotice: {
        level: 'info',
        message: 'Conclua o pagamento pendente para liberar o acesso completo.',
      },
    };
  }

  if (daysSinceDue <= BILLING_GRACE_DAYS_AFTER_DUE) {
    const remaining = BILLING_GRACE_DAYS_AFTER_DUE - daysSinceDue;
    return {
      shellState: 'grace',
      allowBusinessActions: false,
      renewalEligible: true,
      billingNotice: {
        level: daysSinceDue >= 5 ? 'danger' : 'warning',
        message: `Pagamento em atraso. Você tem ${Math.max(0, remaining)} dia(s) para regularizar em Assinatura antes do bloqueio.`,
      },
      graceDaysRemaining: Math.max(0, remaining),
    };
  }

  return {
    shellState: 'blocked',
    allowBusinessActions: false,
    renewalEligible: false,
    billingNotice: {
      level: 'danger',
      message: 'Prazo de tolerância encerrado. Regularize a cobrança para voltar a acessar o painel.',
    },
    graceDaysRemaining: null,
  };
}

/** Usado pelo POST /renew: exige janela de tolerância OU aviso de renovação (plano ativo perto do vencimento). */
export function isRenewalWindowOpen(access: BillingAccessResult): boolean {
  return access.renewalEligible === true;
}
