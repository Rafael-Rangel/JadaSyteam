export type AsaasEnv = 'sandbox' | 'production';

export type AsaasCycle =
  | 'WEEKLY'
  | 'BIWEEKLY'
  | 'MONTHLY'
  | 'BIMONTHLY'
  | 'QUARTERLY'
  | 'SEMIANNUALLY'
  | 'YEARLY';

export type AsaasBillingType = 'BOLETO' | 'PIX' | 'CREDIT_CARD';

function asaasBaseUrl(): string {
  const env = (process.env.ASAAS_ENV || 'sandbox') as AsaasEnv;
  return env === 'production' ? 'https://api.asaas.com/v3' : 'https://api-sandbox.asaas.com/v3';
}

function asaasApiKey(): string {
  const key = process.env.ASAAS_API_KEY || '';
  if (!key) throw new Error('ASAAS_API_KEY não configurada.');
  return key;
}

export class AsaasError extends Error {
  status?: number;
  details?: unknown;
  constructor(message: string, status?: number, details?: unknown) {
    super(message);
    this.name = 'AsaasError';
    this.status = status;
    this.details = details;
  }
}

export type AsaasRequestOptions = {
  timeoutMs?: number;
};

function formatAsaasErrorMessage(status: number, data: unknown): string {
  const errors = (data as { errors?: Array<{ code?: string; description?: string }> })?.errors;
  const first = errors?.[0]?.description || errors?.[0]?.code;
  if (first) return String(first);
  if (status === 401) return 'Chave ASAAS_API_KEY inválida.';
  if (status === 403) {
    return 'Conta Asaas sem permissão para esta operação (ex.: consulta Serasa Experian). Contacte o gerente Asaas.';
  }
  if (status === 400) return 'Pedido inválido para a API Asaas.';
  return 'Erro na API Asaas.';
}

async function asaasRequest<T>(
  path: string,
  init?: RequestInit,
  options?: AsaasRequestOptions
): Promise<T> {
  const url = `${asaasBaseUrl()}${path.startsWith('/') ? '' : '/'}${path}`;
  const timeoutMs = options?.timeoutMs ?? 30_000;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      ...init,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        accept: 'application/json',
        access_token: asaasApiKey(),
        ...(init?.headers || {}),
      },
      cache: 'no-store',
    });

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      throw new AsaasError(formatAsaasErrorMessage(res.status, data), res.status, data);
    }
    return data as T;
  } catch (e) {
    if (e instanceof AsaasError) throw e;
    if ((e as Error)?.name === 'AbortError') {
      throw new AsaasError(`Tempo esgotado (${Math.round(timeoutMs / 1000)}s) ao contactar Asaas.`, 408);
    }
    throw new AsaasError('Falha de comunicação com Asaas.', 503, e);
  } finally {
    clearTimeout(timeout);
  }
}

export function isAsaasConfigured(): boolean {
  return Boolean((process.env.ASAAS_API_KEY || '').trim());
}

export type AsaasCustomerCreateInput = {
  name: string;
  cpfCnpj?: string;
  email?: string;
  phone?: string;
  mobilePhone?: string;
  postalCode?: string;
  address?: string;
  addressNumber?: string;
  complement?: string;
  province?: string;
  city?: string;
  state?: string;
};

export type AsaasCustomer = {
  id: string;
  name: string;
  cpfCnpj?: string;
  email?: string;
};

export async function asaasCreateCustomer(input: AsaasCustomerCreateInput): Promise<AsaasCustomer> {
  return asaasRequest<AsaasCustomer>('/customers', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export type AsaasSubscriptionCreateInput = {
  customer: string;
  billingType: AsaasBillingType;
  nextDueDate: string; // YYYY-MM-DD
  value: number;
  cycle: AsaasCycle;
  description?: string;
  externalReference?: string;
};

export type AsaasSubscription = {
  id: string;
  customer: string;
  billingType: AsaasBillingType;
  cycle: AsaasCycle;
  value: number;
  nextDueDate: string;
  status?: string;
  description?: string;
  externalReference?: string;
};

export async function asaasCreateSubscription(input: AsaasSubscriptionCreateInput): Promise<AsaasSubscription> {
  return asaasRequest<AsaasSubscription>('/subscriptions', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function asaasUpdateSubscription(
  subscriptionId: string,
  input: Partial<{
    billingType: AsaasBillingType;
    value: number;
    cycle: AsaasCycle;
    description: string;
    nextDueDate: string;
  }>
): Promise<AsaasSubscription> {
  return asaasRequest<AsaasSubscription>(`/subscriptions/${subscriptionId}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  });
}

export async function asaasDeleteSubscription(subscriptionId: string): Promise<{ deleted: boolean }> {
  return asaasRequest<{ deleted: boolean }>(`/subscriptions/${subscriptionId}`, {
    method: 'DELETE',
  });
}

export type AsaasPayment = {
  id: string;
  customer: string;
  subscription?: string;
  status: string;
  billingType: AsaasBillingType;
  value: number;
  netValue?: number;
  feeValue?: number;
  dueDate: string;
  invoiceUrl?: string;
  bankSlipUrl?: string;
  pixTransaction?: string;
  externalReference?: string;
  description?: string;
  invoiceNumber?: string | null;
  paymentDate?: string | null;
  clientPaymentDate?: string | null;
  creditDate?: string | null;
  estimatedCreditDate?: string | null;
};

export async function asaasListSubscriptionPayments(subscriptionId: string): Promise<{ data: AsaasPayment[] }> {
  return asaasRequest<{ data: AsaasPayment[] }>(`/subscriptions/${subscriptionId}/payments`, {
    method: 'GET',
  });
}

/** Consulta Serasa Experian via Asaas (custo debitado na conta Asaas). */
export type AsaasCreditBureauReport = {
  id: string;
  dateCreated?: string;
  cpfCnpj?: string;
  customer?: string;
  downloadUrl?: string;
  reportFile?: string;
};

export type AsaasCreditBureauReportCreateInput = {
  cpfCnpj?: string;
  customer?: string;
};

const CREDIT_BUREAU_TIMEOUT_MS = 45_000;

export async function asaasCreateCreditBureauReport(
  input: AsaasCreditBureauReportCreateInput
): Promise<AsaasCreditBureauReport> {
  if (!input.cpfCnpj && !input.customer) {
    throw new AsaasError('Informe cpfCnpj ou customer para consulta Serasa.', 400);
  }
  return asaasRequest<AsaasCreditBureauReport>(
    '/creditBureauReport',
    {
      method: 'POST',
      body: JSON.stringify(input),
    },
    { timeoutMs: CREDIT_BUREAU_TIMEOUT_MS }
  );
}

export async function asaasGetCreditBureauReport(reportId: string): Promise<AsaasCreditBureauReport> {
  return asaasRequest<AsaasCreditBureauReport>(
    `/creditBureauReport/${encodeURIComponent(reportId)}`,
    { method: 'GET' },
    { timeoutMs: CREDIT_BUREAU_TIMEOUT_MS }
  );
}

