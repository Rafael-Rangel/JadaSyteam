import { describe, it, expect, jest, beforeEach } from '@jest/globals';

describe('serasa re-export (Asaas)', () => {
  beforeEach(() => {
    jest.resetModules();
    process.env.ASAAS_API_KEY = 'test-key';
  });

  it('fetchSerasaScoreByCnpj delega para fetchSerasaViaAsaas', async () => {
    jest.doMock('@/lib/asaas', () => ({
      isAsaasConfigured: () => true,
      asaasCreateCreditBureauReport: jest.fn(async () => ({
        id: 'x',
        downloadUrl: 'https://asaas.test/pdf',
      })),
      AsaasError: class AsaasError extends Error {},
    }));

    const { fetchSerasaScoreByCnpj } = await import('@/lib/providers/serasa');
    const result = await fetchSerasaScoreByCnpj('11222333000181');
    expect(result.provider).toBe('asaas');
    expect(result.status).toBe('approved');
  });
});
