/**
 * Verificação de CNPJ via BrasilAPI (Fase 1 - gratuito).
 * Aprova apenas situação cadastral ATIVA; demais casos rejeitados; erro de rede = pending.
 */

const BRASILAPI_BASE = process.env.BRASILAPI_BASE_URL || 'https://brasilapi.com.br';

export type VerificationResult = {
  status: 'approved' | 'rejected' | 'pending';
  reason?: string;
  raw?: Record<string, unknown>;
};

/**
 * Normaliza CNPJ para 14 dígitos (apenas números).
 */
export function normalizeCnpj(cnpj: string): string {
  return (cnpj || '').replace(/\D/g, '').slice(0, 14);
}

/**
 * Valida formato: exatamente 14 dígitos (pode validar dígitos verificadores depois).
 */
export function isValidCnpjFormat(cnpj: string): boolean {
  const digits = normalizeCnpj(cnpj);
  return digits.length === 14 && /^\d{14}$/.test(digits);
}

/**
 * Consulta BrasilAPI e retorna approved apenas se descricao_situacao_cadastral === 'ATIVA'.
 * Em erro de rede/timeout/404 retorna pending para não bloquear o usuário.
 */
export async function verifyCnpjWithBrasilApi(cnpj: string): Promise<VerificationResult> {
  const digits = normalizeCnpj(cnpj);
  if (digits.length !== 14) {
    return { status: 'rejected', reason: 'CNPJ inválido (deve ter 14 dígitos).' };
  }

  const url = `${BRASILAPI_BASE}/api/cnpj/v1/${digits}`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });

    clearTimeout(timeout);

    if (res.status === 404) {
      return { status: 'rejected', reason: 'CNPJ não encontrado na base da Receita Federal.' };
    }

    if (!res.ok) {
      return { status: 'pending', reason: 'Serviço de consulta indisponível. Tente novamente mais tarde.' };
    }

    const data = (await res.json()) as Record<string, unknown>;
    const situacao = typeof data.descricao_situacao_cadastral === 'string'
      ? (data.descricao_situacao_cadastral as string).trim().toUpperCase()
      : '';

    if (situacao === 'ATIVA') {
      return { status: 'approved', reason: 'Empresa com situação cadastral ATIVA.', raw: data };
    }

    if (situacao) {
      return {
        status: 'rejected',
        reason: `Situação cadastral: ${situacao}. Apenas empresas ATIVAS podem usar esta funcionalidade.`,
        raw: data,
      };
    }

    return { status: 'pending', reason: 'Não foi possível obter a situação cadastral.', raw: data };
  } catch (e) {
    console.error('CNPJ verification error:', e);
    return {
      status: 'pending',
      reason: 'Erro ao consultar CNPJ. Sua empresa ficará em análise; você pode tentar novamente mais tarde.',
    };
  }
}
