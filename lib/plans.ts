export const PLAN_LIMITS: Record<string, { users: number; requestsPerMonth: number; proposalsPerMonth: number }> = {
  starter: { users: 3, requestsPerMonth: 20, proposalsPerMonth: 100 },
  growth: { users: 10, requestsPerMonth: 200, proposalsPerMonth: 1000 },
  enterprise: { users: 100, requestsPerMonth: 99999, proposalsPerMonth: 99999 },
};

export const PLAN_NAMES: Record<string, string> = {
  starter: 'Starter',
  growth: 'Growth',
  enterprise: 'Enterprise',
};

export const PLAN_PRICES: Record<string, number> = {
  starter: 49,
  growth: 199,
  enterprise: 799,
};

export const PLAN_IDS = ['starter', 'growth', 'enterprise'] as const;

export const PLAN_DESCRIPTIONS: Record<string, string> = {
  starter: 'Ideal para empresas pequenas',
  growth: 'Para empresas em crescimento',
  enterprise: 'Solução completa para grandes empresas',
};

export const PLAN_FEATURES: Record<string, string[]> = {
  starter: [
    '3 usuários por empresa',
    '20 requisições/mês (comprador)',
    '100 propostas/mês (vendedor)',
    'Raio padrão: 20km (configurável)',
    '3 categorias desbloqueadas',
    'Relatórios básicos',
    'Suporte por e-mail (48h)',
  ],
  growth: [
    '10 usuários por empresa',
    '200 requisições/mês (comprador)',
    '1.000 propostas/mês (vendedor)',
    'Raio padrão: 50km (configurável)',
    '10 categorias desbloqueadas',
    'Destaque de requisição (limitado)',
    'Export CSV',
    'Integrações básicas de ERP',
    'Suporte e-mail + chat (horário comercial)',
  ],
  enterprise: [
    'Usuários ilimitados',
    'Requisições ilimitadas',
    'Propostas ilimitadas',
    'Raio ilimitado (configurável)',
    'Todas as categorias desbloqueadas',
    'Integração via API',
    'SSO/LDAP',
    'SLA de suporte',
    'Relatórios avançados',
    'Conta dedicada',
    'Suporte prioritário',
  ],
};

/** ID do plano marcado como "Mais Popular" na página de planos */
export const PLAN_POPULAR_ID = 'growth';

export function getPlanLimits(plan: string) {
  return PLAN_LIMITS[plan] ?? PLAN_LIMITS.starter;
}

export function getPlanPrice(plan: string): number {
  return PLAN_PRICES[plan] ?? 0;
}

export function getPlanName(plan: string): string {
  return PLAN_NAMES[plan] ?? plan;
}

export function getPlanDescription(plan: string): string {
  return PLAN_DESCRIPTIONS[plan] ?? '';
}

export function getPlanFeatures(plan: string): string[] {
  return PLAN_FEATURES[plan] ?? [];
}
