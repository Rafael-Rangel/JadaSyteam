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

async function asaasRequest<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const url = `${asaasBaseUrl()}${path.startsWith('/') ? '' : '/'}${path}`;
  const res = await fetch(url, {
    ...init,
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
    throw new AsaasError(
      (data && typeof data === 'object' && 'errors' in (data as any))
        ? 'Erro na API Asaas.'
        : 'Erro ao chamar Asaas.',
      res.status,
      data
    );
  }
  return data as T;
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
  dueDate: string;
  invoiceUrl?: string;
  bankSlipUrl?: string;
  pixTransaction?: string;
  externalReference?: string;
};

export async function asaasListSubscriptionPayments(subscriptionId: string): Promise<{ data: AsaasPayment[] }> {
  return asaasRequest<{ data: AsaasPayment[] }>(`/subscriptions/${subscriptionId}/payments`, {
    method: 'GET',
  });
}

