import {
  getEffectiveCompanyId,
  isAssistantRole,
  isPlatformRole,
  requireEffectiveCompanyId,
} from '@/lib/sessionContext';
import { maskCnpj, redactCompanyForAssistant } from '@/lib/redactCompanyForAssistant';

describe('sessionContext assistant', () => {
  it('getEffectiveCompanyId usa actingCompanyId para assistant', () => {
    expect(
      getEffectiveCompanyId({
        id: 'u1',
        role: 'assistant',
        companyId: 'platform',
        actingCompanyId: 'client-1',
      })
    ).toBe('client-1');
  });

  it('getEffectiveCompanyId usa companyId para owner', () => {
    expect(
      getEffectiveCompanyId({
        id: 'u2',
        role: 'owner',
        companyId: 'client-1',
      })
    ).toBe('client-1');
  });

  it('requireEffectiveCompanyId falha sem actingCompanyId', () => {
    const r = requireEffectiveCompanyId({
      id: 'u1',
      role: 'assistant',
      companyId: 'platform',
    });
    expect(r.ok).toBe(false);
  });

  it('isPlatformRole e isAssistantRole', () => {
    expect(isPlatformRole('admin')).toBe(true);
    expect(isPlatformRole('assistant')).toBe(true);
    expect(isPlatformRole('owner')).toBe(false);
    expect(isAssistantRole('assistant')).toBe(true);
  });
});

describe('redactCompanyForAssistant', () => {
  it('mascara CNPJ e remove campos sensíveis', () => {
    const raw = {
      name: 'ACME',
      cnpj: '12345678000199',
      verificationPayload: { secret: true },
      serasaScore: 800,
      plan: 'growth',
    };
    const out = redactCompanyForAssistant(raw);
    expect(out.verificationPayload).toBeUndefined();
    expect(out.serasaScore).toBeUndefined();
    expect(out.cnpj).toBe(maskCnpj('12345678000199'));
    expect(out.cnpj).not.toContain('12345678000199');
    expect(out.name).toBe('ACME');
  });

  it('maskCnpj mantém últimos 4 dígitos', () => {
    expect(maskCnpj('12345678000199')).toMatch(/0199$/);
  });
});
