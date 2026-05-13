import { describe, it, expect, jest, beforeEach } from '@jest/globals';

describe('serasa provider', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.restoreAllMocks();
    process.env.SERASA_BASE_URL = 'https://api.serasa.com.br';
    process.env.SERASA_CLIENT_ID = 'client';
    process.env.SERASA_CLIENT_SECRET = 'secret';
  });

  it('retorna score e risk level', async () => {
    jest.spyOn(global, 'fetch' as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ access_token: 'token' }),
      } as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ score: 750, restrictions: 0 }),
      } as any);

    const { fetchSerasaScoreByCnpj } = await import('@/lib/providers/serasa');
    const result = await fetchSerasaScoreByCnpj('11222333000181');
    expect(result.status).toBe('approved');
    expect(result.score).toBe(750);
    expect(result.riskLevel).toBe('low');
  });
});
