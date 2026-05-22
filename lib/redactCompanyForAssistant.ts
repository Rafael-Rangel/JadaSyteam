const SENSITIVE_KEYS = new Set([
  'verificationPayload',
  'judicialFlags',
  'serasaScore',
  'serasaCheckedAt',
  'lastDueDiligenceAt',
  'riskLevel',
  'billingLastPayload',
  'billingCustomerId',
  'billingSubscriptionId',
  'billingLastEventAt',
]);

/** Máscara CNPJ: mantém últimos 4 dígitos. */
export function maskCnpj(cnpj: string): string {
  const digits = cnpj.replace(/\D/g, '');
  if (digits.length < 4) return '**.***.***/****-**';
  const tail = digits.slice(-4);
  return `**.***.***/****-${tail}`;
}

export function redactCompanyForAssistant<T extends Record<string, unknown>>(data: T): T {
  const out: Record<string, unknown> = { ...data };
  for (const key of SENSITIVE_KEYS) {
    delete out[key];
  }
  if (typeof out.cnpj === 'string') {
    out.cnpj = maskCnpj(out.cnpj);
  }
  return out as T;
}

export function shouldRedactForSession(role?: string): boolean {
  return role === 'assistant';
}
