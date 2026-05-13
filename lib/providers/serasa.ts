import { rateLimitByKey } from '@/lib/rateLimit';
import type { RiskLevel, SerasaResult } from '@/lib/providers/types';

const SERASA_BASE_URL = process.env.SERASA_BASE_URL || '';
const SERASA_CLIENT_ID = process.env.SERASA_CLIENT_ID || '';
const SERASA_CLIENT_SECRET = process.env.SERASA_CLIENT_SECRET || '';

function scoreToRisk(score: number | null): RiskLevel {
  if (score == null) return 'unknown';
  if (score < 400) return 'high';
  if (score < 700) return 'medium';
  return 'low';
}

async function getSerasaToken(): Promise<string | null> {
  if (!SERASA_BASE_URL || !SERASA_CLIENT_ID || !SERASA_CLIENT_SECRET) return null;
  const response = await fetch(`${SERASA_BASE_URL}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: SERASA_CLIENT_ID,
      client_secret: SERASA_CLIENT_SECRET,
    }),
  });
  if (!response.ok) return null;
  const payload = (await response.json()) as { access_token?: string };
  return payload.access_token || null;
}

export async function fetchSerasaScoreByCnpj(cnpj: string): Promise<SerasaResult> {
  const normalized = (cnpj || '').replace(/\D/g, '');
  const limiter = rateLimitByKey('provider:serasa:global', 20, 60_000);
  if (!limiter.allowed) {
    return {
      provider: 'serasa',
      status: 'pending',
      reason: 'Limite interno para Serasa atingido.',
      score: null,
      restrictions: null,
      riskLevel: 'unknown',
      raw: null,
    };
  }

  const token = await getSerasaToken();
  if (!token) {
    return {
      provider: 'serasa',
      status: 'pending',
      reason: 'Credenciais Serasa não configuradas.',
      score: null,
      restrictions: null,
      riskLevel: 'unknown',
      raw: null,
    };
  }

  try {
    const response = await fetch(`${SERASA_BASE_URL}/score-pj`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ cnpj: normalized }),
    });
    if (!response.ok) {
      return {
        provider: 'serasa',
        status: 'pending',
        reason: `Serasa indisponível (${response.status}).`,
        score: null,
        restrictions: null,
        riskLevel: 'unknown',
        raw: null,
      };
    }
    const payload = (await response.json()) as Record<string, unknown>;
    const score =
      typeof payload.score === 'number'
        ? payload.score
        : typeof payload.pontuacao === 'number'
          ? payload.pontuacao
          : null;
    const restrictions =
      typeof payload.restrictions === 'number'
        ? payload.restrictions
        : typeof payload.restricoes === 'number'
          ? payload.restricoes
          : null;
    return {
      provider: 'serasa',
      status: 'approved',
      reason: 'Consulta de score concluída.',
      score,
      restrictions,
      riskLevel: scoreToRisk(score),
      raw: payload,
    };
  } catch (error) {
    return {
      provider: 'serasa',
      status: 'pending',
      reason: 'Falha de comunicação com Serasa.',
      score: null,
      restrictions: null,
      riskLevel: 'unknown',
      raw: null,
    };
  }
}
