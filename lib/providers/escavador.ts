import { rateLimitByKey } from '@/lib/rateLimit';
import { getCachedValue, setCachedValue, withInFlightDedup } from '@/lib/providers/cache';
import type { JudicialResult, RiskLevel } from '@/lib/providers/types';

const ESCAVADOR_BASE_URL = process.env.ESCAVADOR_BASE_URL || 'https://api.escavador.com';
const ESCAVADOR_API_TOKEN = process.env.ESCAVADOR_API_TOKEN || '';
const ESCAVADOR_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

function classifyRisk(total: number, labor: number, highValue: number): RiskLevel {
  if (highValue > 0 || labor >= 5) return 'high';
  if (total > 0 || labor > 0) return 'medium';
  return 'low';
}

export async function fetchJudicialRiskByCnpj(cnpj: string): Promise<JudicialResult> {
  const normalized = (cnpj || '').replace(/\D/g, '');
  const cacheKey = `escavador:${normalized}`;
  const cached = getCachedValue<JudicialResult>(cacheKey);
  if (cached) return cached;

  return withInFlightDedup(cacheKey, async () => {
    if (!ESCAVADOR_API_TOKEN) {
      return {
        provider: 'escavador',
        status: 'pending',
        reason: 'ESCAVADOR_API_TOKEN não configurado.',
        totalCases: 0,
        laborCases: 0,
        civilCases: 0,
        highValueCases: 0,
        riskLevel: 'unknown',
        raw: null,
      };
    }

    const limiter = rateLimitByKey('provider:escavador:global', 60, 60_000);
    if (!limiter.allowed) {
      return {
        provider: 'escavador',
        status: 'pending',
        reason: 'Limite interno de consulta Escavador atingido.',
        totalCases: 0,
        laborCases: 0,
        civilCases: 0,
        highValueCases: 0,
        riskLevel: 'unknown',
        raw: null,
      };
    }

    try {
      const response = await fetch(`${ESCAVADOR_BASE_URL}/v2/envolvidos?cpf_cnpj=${normalized}`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${ESCAVADOR_API_TOKEN}`,
        },
        cache: 'no-store',
      });

      if (!response.ok) {
        return {
          provider: 'escavador',
          status: 'pending',
          reason: `Escavador indisponível (${response.status}).`,
          totalCases: 0,
          laborCases: 0,
          civilCases: 0,
          highValueCases: 0,
          riskLevel: 'unknown',
          raw: null,
        };
      }

      const payload = (await response.json()) as Record<string, unknown>;
      const list = Array.isArray(payload.items) ? payload.items : Array.isArray(payload.data) ? payload.data : [];

      const totalCases = list.length;
      const laborCases = list.filter((item) => {
        const text = JSON.stringify(item).toLowerCase();
        return text.includes('trabalh');
      }).length;
      const civilCases = list.filter((item) => {
        const text = JSON.stringify(item).toLowerCase();
        return text.includes('cível') || text.includes('civel');
      }).length;
      const highValueCases = list.filter((item) => {
        const text = JSON.stringify(item).toLowerCase();
        return text.includes('valor da causa') && /\d{6,}/.test(text);
      }).length;
      const riskLevel = classifyRisk(totalCases, laborCases, highValueCases);

      const result: JudicialResult = {
        provider: 'escavador',
        status: 'approved',
        reason: 'Consulta judicial concluída.',
        totalCases,
        laborCases,
        civilCases,
        highValueCases,
        riskLevel,
        raw: payload,
      };
      setCachedValue(cacheKey, result, ESCAVADOR_CACHE_TTL_MS);
      return result;
    } catch (error) {
      return {
        provider: 'escavador',
        status: 'pending',
        reason: 'Falha de comunicação com Escavador.',
        totalCases: 0,
        laborCases: 0,
        civilCases: 0,
        highValueCases: 0,
        riskLevel: 'unknown',
        raw: null,
      };
    }
  });
}
