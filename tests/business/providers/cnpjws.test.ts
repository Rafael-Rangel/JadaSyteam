import { describe, it, expect, jest, beforeEach } from '@jest/globals';

describe('cnpjws provider', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.restoreAllMocks();
    process.env.CNPJWS_API_KEY = 'token';
    process.env.CNPJWS_BASE_URL = 'https://api.cnpj.ws';
    process.env.CNPJWS_RATE_LIMIT_PER_MIN = '100';
  });

  it('retorna approved para situacao ATIVA', async () => {
    jest.spyOn(global, 'fetch' as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        estabelecimento: { situacao_cadastral: 'ATIVA' },
        empresa: { razao_social: 'Empresa Teste', capital_social: 1000 },
        simples: { simples_nacional: true, mei: false },
        socios: [{ nome: 'Socio 1' }],
      }),
    } as any);

    const { verifyCnpjWithCnpjWs } = await import('@/lib/providers/cnpjws');
    const result = await verifyCnpjWithCnpjWs('11222333000181');
    expect(result.status).toBe('approved');
    expect(result.provider).toBe('cnpjws');
  });

  it('tenta modo publico sem token quando habilitado', async () => {
    process.env.CNPJWS_API_KEY = '';
    process.env.CNPJWS_ALLOW_PUBLIC_NO_KEY = 'true';
    const fetchMock = jest.spyOn(global, 'fetch' as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        estabelecimento: { situacao_cadastral: 'ATIVA' },
        empresa: { razao_social: 'Empresa Publica Teste' },
      }),
    } as any);

    const { verifyCnpjWithCnpjWs } = await import('@/lib/providers/cnpjws');
    const result = await verifyCnpjWithCnpjWs('11222333000181');
    expect(result.provider).toBe('cnpjws');
    expect(fetchMock).toHaveBeenCalled();
  });
});
