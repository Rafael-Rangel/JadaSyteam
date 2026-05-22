import { prisma } from '@/lib/prisma';
import { PLATFORM_COMPANY_CNPJ } from '@/lib/platformCompany';

export async function getPlatformCompanyId(): Promise<string | null> {
  const company = await prisma.company.findFirst({
    where: { cnpj: PLATFORM_COMPANY_CNPJ },
    select: { id: true },
  });
  return company?.id ?? null;
}
