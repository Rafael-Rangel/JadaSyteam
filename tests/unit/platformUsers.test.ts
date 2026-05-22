import { permissionsForRole } from '@/lib/platformUsers';

describe('permissionsForRole', () => {
  it('admin tem acesso ao painel administrativo', () => {
    const p = permissionsForRole('admin', false);
    expect(p.canAccessAdmin).toBe(true);
    expect(p.canAccessAssistantHub).toBe(false);
  });

  it('assistente tem hub e operação em clientes', () => {
    const p = permissionsForRole('assistant', true);
    expect(p.canAccessAdmin).toBe(false);
    expect(p.canAccessAssistantHub).toBe(true);
    expect(p.canManageClientOperations).toBe(true);
    expect(p.restrictToAssignedCompanies).toBe(true);
  });
});
