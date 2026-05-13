import type { Prisma } from '@prisma/client';

/**
 * CNPJ reservado para a empresa sistema criada em `scripts/create-admin.ts`.
 * Não deve aparecer em listagens nem entrar em métricas de clientes.
 */
export const PLATFORM_COMPANY_CNPJ = '00000000000000';

export const excludePlatformCompanyWhere: Prisma.CompanyWhereInput = {
  cnpj: { not: PLATFORM_COMPANY_CNPJ },
};

/** Usuários ligados apenas a empresas reais (exclui conta admin da plataforma). */
export const excludePlatformCompanyUsersWhere: Prisma.UserWhereInput = {
  company: excludePlatformCompanyWhere,
};

export function andExcludePlatformCompany(
  filter?: Prisma.CompanyWhereInput
): Prisma.CompanyWhereInput {
  if (!filter || Object.keys(filter).length === 0) {
    return excludePlatformCompanyWhere;
  }
  return { AND: [excludePlatformCompanyWhere, filter] };
}
