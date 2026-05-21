import { describe, it, expect, jest, beforeEach } from '@jest/globals';

describe('asaasSerasa provider', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.restoreAllMocks();
    process.env.ASAAS_API_KEY = 'test-key';
    process.env.ASAAS_ENV = 'sandbox';
  });

  it('retorna approved com downloadUrl quando Asaas responde', async () => {
    jest.doMock('@/lib/asaas', () => ({
      isAsaasConfigured: () => true,
      asaasCreateCreditBureauReport: jest.fn(async () => ({
        id: 'report-1',
        dateCreated: '2026-05-21',
        cpfCnpj: '11222333000181',
        downloadUrl: 'https://www.asaas.com.br/creditBureauReport/download/report-1',
        reportFile: 'base64pdf',
      })),
      AsaasError: class AsaasError extends Error {},
    }));

    const { fetchSerasaViaAsaas } = await import('@/lib/providers/asaasSerasa');
    const result = await fetchSerasaViaAsaas('11222333000181');
    expect(result.provider).toBe('asaas');
    expect(result.status).toBe('approved');
    expect(result.downloadUrl).toContain('creditBureauReport');
    expect(result.score).toBeNull();
    expect(result.hasReportFile).toBe(true);
  });

  it('usa billingCustomerId quando informado', async () => {
    const create = jest.fn(async () => ({
      id: 'r2',
      downloadUrl: 'https://example.com/pdf',
    }));
    jest.doMock('@/lib/asaas', () => ({
      isAsaasConfigured: () => true,
      asaasCreateCreditBureauReport: create,
      AsaasError: class AsaasError extends Error {},
    }));

    const { fetchSerasaViaAsaas } = await import('@/lib/providers/asaasSerasa');
    await fetchSerasaViaAsaas('11222333000181', 'cus_123');
    expect(create).toHaveBeenCalledWith({ customer: 'cus_123' });
  });
});
