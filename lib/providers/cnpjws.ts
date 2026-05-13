import { verifyCnpjWithBrasilApi } from '@/lib/cnpjVerification';
import { rateLimitByKey } from '@/lib/rateLimit';
import { getCachedValue, setCachedValue, withInFlightDedup } from '@/lib/providers/cache';
import type { CadastralResult } from '@/lib/providers/types';

const CNPJWS_BASE_URL = process.env.CNPJWS_BASE_URL || 'https://publica.cnpj.ws';
const CNPJWS_API_KEY = process.env.CNPJWS_API_KEY || '';
const CNPJWS_RATE_LIMIT_PER_MIN = Number(process.env.CNPJWS_RATE_LIMIT_PER_MIN || 3);
const CNPJWS_ALLOW_PUBLIC_NO_KEY = (process.env.CNPJWS_ALLOW_PUBLIC_NO_KEY || 'true') === 'true';
const CNPJWS_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

function toNumber(value: unknown): number | null {
  const num = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(num) ? num : null;
}

function parseCnpjWsPayload(payload: Record<string, unknown>): CadastralResult {
  const establishment = (payload.estabelecimento as Record<string, unknown> | undefined) || {};
  const company = (payload.empresa as Record<string, unknown> | undefined) || {};
  const statusText = String(establishment.situacao_cadastral || '').toUpperCase();
  const isActive = statusText.includes('ATIVA');
  const simples = (payload.simples as Record<string, unknown> | undefined) || {};
  const qsa = Array.isArray(payload.socios)
    ? payload.socios.map((s) => {
        const socio = s as Record<string, unknown>;
        return {
          name: String(socio.nome || ''),
          qualification: socio.qualificacao_socio ? String(socio.qualificacao_socio) : null,
          share: toNumber(socio.percentual_capital_social),
        };
      })
    : [];

  return {
    provider: 'cnpjws',
    status: isActive ? 'approved' : statusText ? 'rejected' : 'pending',
    reason: isActive ? 'Empresa ATIVA na Receita Federal (CNPJ.ws).' : `Situação cadastral: ${statusText || 'indisponível'}`,
    companyName: company.razao_social ? String(company.razao_social) : undefined,
    legalNature: company.natureza_juridica ? String(company.natureza_juridica) : undefined,
    cnaePrimary: establishment.atividade_principal ? String(establishment.atividade_principal) : undefined,
    cnaeSecondary: Array.isArray(establishment.atividades_secundarias)
      ? establishment.atividades_secundarias.map((item) => String(item))
      : [],
    size: company.porte ? String(company.porte) : undefined,
    capitalSocial: toNumber(company.capital_social),
    simplesNacional: typeof simples.simples_nacional === 'boolean' ? simples.simples_nacional : null,
    mei: typeof simples.mei === 'boolean' ? simples.mei : null,
    qsa,
    raw: payload,
  };
}

export async function verifyCnpjWithCnpjWs(cnpj: string): Promise<CadastralResult> {
  const normalized = (cnpj || '').replace(/\D/g, '');
  const cacheKey = `cnpjws:${normalized}`;
  const cached = getCachedValue<CadastralResult>(cacheKey);
  if (cached) return cached;

  return withInFlightDedup(cacheKey, async () => {
    const limiter = rateLimitByKey(`provider:cnpjws:global`, CNPJWS_RATE_LIMIT_PER_MIN, 60_000);
    if (!limiter.allowed) {
      const fallback = await verifyCnpjWithBrasilApi(normalized);
      return {
        provider: 'brasilapi',
        status: fallback.status,
        reason: `CNPJ.ws com limite atingido; fallback BrasilAPI: ${fallback.reason || 'ok'}`,
        raw: fallback.raw || null,
      };
    }

    if (!CNPJWS_API_KEY && !CNPJWS_ALLOW_PUBLIC_NO_KEY) {
      const fallback = await verifyCnpjWithBrasilApi(normalized);
      return {
        provider: 'brasilapi',
        status: fallback.status,
        reason: `CNPJWS_API_KEY ausente e modo público desativado; fallback BrasilAPI: ${fallback.reason || 'ok'}`,
        raw: fallback.raw || null,
      };
    }

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15_000);
      const headers: Record<string, string> = { Accept: 'application/json' };
      if (CNPJWS_API_KEY) {
        headers.Authorization = `Bearer ${CNPJWS_API_KEY}`;
      }
      const response = await fetch(`${CNPJWS_BASE_URL}/v1/cnpj/${normalized}`, {
        headers,
        signal: controller.signal,
        cache: 'no-store',
      });
      clearTimeout(timeout);

      if (!response.ok) {
        const fallback = await verifyCnpjWithBrasilApi(normalized);
        return {
          provider: 'brasilapi',
          status: fallback.status,
          reason: `Erro CNPJ.ws (${response.status})${CNPJWS_API_KEY ? '' : ' em modo público'}; fallback BrasilAPI: ${fallback.reason || 'ok'}`,
          raw: fallback.raw || null,
        };
      }

      const payload = (await response.json()) as Record<string, unknown>;
      const result = parseCnpjWsPayload(payload);
      setCachedValue(cacheKey, result, CNPJWS_CACHE_TTL_MS);
      return result;
    } catch (error) {
      const fallback = await verifyCnpjWithBrasilApi(normalized);
      return {
        provider: 'brasilapi',
        status: fallback.status,
        reason: `Falha CNPJ.ws${CNPJWS_API_KEY ? '' : ' em modo público'}; fallback BrasilAPI: ${fallback.reason || 'ok'}`,
        raw: fallback.raw || null,
      };
    }
  });
}
