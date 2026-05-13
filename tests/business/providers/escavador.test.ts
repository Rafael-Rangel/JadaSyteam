import { describe, it, expect, jest, beforeEach } from '@jest/globals';

describe('escavador provider', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.restoreAllMocks();
    process.env.ESCAVADOR_API_TOKEN = 'token';
    process.env.ESCAVADOR_BASE_URL = 'https://api.escavador.com';
  });

  it('retorna approved com agregados de processos', async () => {
    jest.spyOn(global, 'fetch' as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        items: [{ area: 'trabalhista' }, { area: 'civel' }],
      }),
    } as any);

    const { fetchJudicialRiskByCnpj } = await import('@/lib/providers/escavador');
    const result = await fetchJudicialRiskByCnpj('11222333000181');
    expect(result.status).toBe('approved');
    expect(result.totalCases).toBe(2);
  });
});
