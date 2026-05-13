import { prisma } from '@/lib/prisma';
import { fetchJudicialRiskByCnpj } from '@/lib/providers/escavador';
import { fetchSerasaScoreByCnpj } from '@/lib/providers/serasa';
import { verifyCnpjWithCnpjWs } from '@/lib/providers/cnpjws';
import type { ProviderVerificationStatus, RiskLevel } from '@/lib/providers/types';

type DueDiligenceSummary = {
  cadastralStatus: ProviderVerificationStatus;
  judicialStatus: ProviderVerificationStatus;
  verificationStatus: 'approved' | 'pending' | 'rejected';
  riskLevel: RiskLevel;
};

function mergeRisk(base: RiskLevel, other: RiskLevel): RiskLevel {
  const order: RiskLevel[] = ['unknown', 'low', 'medium', 'high'];
  return order.indexOf(other) > order.indexOf(base) ? other : base;
}

function decideVerificationStatus(
  cadastralStatus: ProviderVerificationStatus,
  judicialStatus: ProviderVerificationStatus,
  judicialRisk: RiskLevel
): 'approved' | 'pending' | 'rejected' {
  if (cadastralStatus === 'rejected') return 'rejected';
  if (judicialRisk === 'high') return 'rejected';
  if (cadastralStatus === 'pending' || judicialStatus === 'pending' || judicialStatus === 'error') {
    return 'pending';
  }
  return 'approved';
}

export async function runDueDiligenceForCompany(companyId: string): Promise<DueDiligenceSummary> {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { id: true, cnpj: true },
  });
  if (!company) throw new Error('Empresa não encontrada para due diligence.');

  const cadastral = await verifyCnpjWithCnpjWs(company.cnpj);
  const judicial = await fetchJudicialRiskByCnpj(company.cnpj);

  const riskLevel = mergeRisk(cadastral.status === 'rejected' ? 'high' : 'low', judicial.riskLevel);
  const verificationStatus = decideVerificationStatus(cadastral.status, judicial.status, judicial.riskLevel);

  await prisma.$transaction([
    prisma.dueDiligenceReport.create({
      data: {
        companyId,
        provider: cadastral.provider,
        kind: 'cadastral',
        status: cadastral.status,
        summary: {
          reason: cadastral.reason,
          companyName: cadastral.companyName ?? null,
          cnaePrimary: cadastral.cnaePrimary ?? null,
          legalNature: cadastral.legalNature ?? null,
          size: cadastral.size ?? null,
          simplesNacional: cadastral.simplesNacional ?? null,
          mei: cadastral.mei ?? null,
        },
        payload: (cadastral.raw as any) ?? undefined,
        riskLevel,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    }),
    prisma.dueDiligenceReport.create({
      data: {
        companyId,
        provider: judicial.provider,
        kind: 'judicial',
        status: judicial.status,
        summary: {
          reason: judicial.reason,
          totalCases: judicial.totalCases,
          laborCases: judicial.laborCases,
          civilCases: judicial.civilCases,
          highValueCases: judicial.highValueCases,
        },
        payload: (judicial.raw as any) ?? undefined,
        riskLevel: judicial.riskLevel,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    }),
    prisma.company.update({
      where: { id: companyId },
      data: {
        verificationStatus,
        verifiedAt: new Date(),
        verificationPayload: (cadastral.raw as any) ?? undefined,
        riskLevel,
        lastDueDiligenceAt: new Date(),
        judicialFlags: {
          totalCases: judicial.totalCases,
          laborCases: judicial.laborCases,
          civilCases: judicial.civilCases,
          highValueCases: judicial.highValueCases,
        },
      },
    }),
  ]);

  return {
    cadastralStatus: cadastral.status,
    judicialStatus: judicial.status,
    verificationStatus,
    riskLevel,
  };
}

export async function runSerasaForCompany(companyId: string) {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { id: true, cnpj: true },
  });
  if (!company) throw new Error('Empresa não encontrada para consulta Serasa.');

  const result = await fetchSerasaScoreByCnpj(company.cnpj);
  const currentRisk = result.riskLevel;

  await prisma.$transaction([
    prisma.dueDiligenceReport.create({
      data: {
        companyId,
        provider: result.provider,
        kind: 'score',
        status: result.status,
        summary: {
          reason: result.reason,
          restrictions: result.restrictions,
        },
        payload: (result.raw as any) ?? undefined,
        score: result.score ?? undefined,
        riskLevel: currentRisk,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    }),
    prisma.company.update({
      where: { id: companyId },
      data: {
        serasaScore: result.score ?? null,
        serasaCheckedAt: new Date(),
        riskLevel: currentRisk,
        lastDueDiligenceAt: new Date(),
      },
    }),
  ]);

  return result;
}
