import {
  AsaasError,
  asaasCreateCreditBureauReport,
  isAsaasConfigured,
} from '@/lib/asaas';
import { rateLimitByKey } from '@/lib/rateLimit';
import type { RiskLevel, SerasaResult } from '@/lib/providers/types';

function normalizeCnpj(cnpj: string): string {
  return (cnpj || '').replace(/\D/g, '').slice(0, 14);
}

function payloadForStorage(report: {
  id: string;
  dateCreated?: string;
  cpfCnpj?: string;
  customer?: string;
  downloadUrl?: string;
  reportFile?: string;
}): Record<string, unknown> {
  return {
    id: report.id,
    dateCreated: report.dateCreated ?? null,
    cpfCnpj: report.cpfCnpj ?? null,
    customer: report.customer ?? null,
    downloadUrl: report.downloadUrl ?? null,
    hasReportFile: Boolean(report.reportFile),
  };
}

/**
 * Consulta Serasa Experian via Asaas POST /v3/creditBureauReport.
 * Requer permissão na conta Asaas e saldo; PDF em downloadUrl (válido até 23:59 do dia).
 */
export async function fetchSerasaViaAsaas(
  cnpj: string,
  billingCustomerId?: string | null
): Promise<SerasaResult> {
  const normalized = normalizeCnpj(cnpj);
  if (normalized.length !== 14) {
    return {
      provider: 'asaas',
      status: 'rejected',
      reason: 'CNPJ inválido (deve ter 14 dígitos).',
      score: null,
      restrictions: null,
      riskLevel: 'unknown',
      raw: null,
    };
  }

  if (!isAsaasConfigured()) {
    return {
      provider: 'asaas',
      status: 'pending',
      reason: 'ASAAS_API_KEY não configurada.',
      score: null,
      restrictions: null,
      riskLevel: 'unknown',
      raw: null,
    };
  }

  const limiter = rateLimitByKey('provider:asaas-serasa:global', 10, 60_000);
  if (!limiter.allowed) {
    return {
      provider: 'asaas',
      status: 'pending',
      reason: 'Limite interno de consultas Serasa (Asaas) atingido. Aguarde um minuto.',
      score: null,
      restrictions: null,
      riskLevel: 'unknown',
      raw: null,
    };
  }

  try {
    const body =
      billingCustomerId && billingCustomerId.trim()
        ? { customer: billingCustomerId.trim() }
        : { cpfCnpj: normalized };

    const report = await asaasCreateCreditBureauReport(body);

    return {
      provider: 'asaas',
      status: 'approved',
      reason: 'Consulta Serasa (Asaas) concluída. Abra o PDF pelo link de download.',
      score: null,
      restrictions: null,
      riskLevel: 'unknown' as RiskLevel,
      reportId: report.id ?? null,
      downloadUrl: report.downloadUrl ?? null,
      dateCreated: report.dateCreated ?? null,
      hasReportFile: Boolean(report.reportFile),
      raw: payloadForStorage(report),
    };
  } catch (e) {
    const msg = e instanceof AsaasError ? e.message : 'Falha ao consultar Serasa via Asaas.';
    const status = e instanceof AsaasError ? e.status : undefined;
    const isClient = status != null && status >= 400 && status < 500;
    return {
      provider: 'asaas',
      status: isClient ? 'rejected' : 'pending',
      reason: msg,
      score: null,
      restrictions: null,
      riskLevel: 'unknown',
      raw: e instanceof AsaasError ? (e.details as Record<string, unknown>) : null,
    };
  }
}
