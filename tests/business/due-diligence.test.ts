import { describe, it, expect, jest, beforeEach } from '@jest/globals';

const prismaMock = {
  company: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  dueDiligenceReport: {
    create: jest.fn(),
  },
  $transaction: jest.fn(async (ops: any[]) => Promise.all(ops)),
};

jest.mock('@/lib/prisma', () => ({
  prisma: prismaMock,
}));

jest.mock('@/lib/providers/cnpjws', () => ({
  verifyCnpjWithCnpjWs: jest.fn(async () => ({
    provider: 'cnpjws',
    status: 'approved',
    reason: 'ok',
    raw: { source: 'cnpjws' },
  })),
}));

jest.mock('@/lib/providers/escavador', () => ({
  fetchJudicialRiskByCnpj: jest.fn(async () => ({
    provider: 'escavador',
    status: 'approved',
    reason: 'ok',
    totalCases: 0,
    laborCases: 0,
    civilCases: 0,
    highValueCases: 0,
    riskLevel: 'low',
    raw: { source: 'escavador' },
  })),
}));

const { runDueDiligenceForCompany } = require('@/lib/dueDiligence');

describe('due diligence orchestrator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    prismaMock.company.findUnique.mockResolvedValue({
      id: 'company-1',
      cnpj: '11222333000181',
    });
    prismaMock.company.update.mockResolvedValue({});
    prismaMock.dueDiligenceReport.create.mockResolvedValue({});
  });

  it('executa due diligence e retorna approved', async () => {
    const result = await runDueDiligenceForCompany('company-1');
    expect(result.verificationStatus).toBe('approved');
    expect(prismaMock.$transaction).toHaveBeenCalled();
  });
});
