import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface User {
    id?: string;
    companyId?: string;
    role?: string;
    companyType?: string;
    restrictToAssignedCompanies?: boolean;
    actingCompanyId?: string | null;
    actingCompanyType?: string | null;
  }

  interface Session {
    user: User & {
      id?: string;
      companyId?: string;
      role?: string;
      companyType?: string;
      restrictToAssignedCompanies?: boolean;
      actingCompanyId?: string | null;
      actingCompanyType?: string | null;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    companyId?: string;
    role?: string;
    companyType?: string;
    restrictToAssignedCompanies?: boolean;
    actingCompanyId?: string | null;
    actingCompanyType?: string | null;
  }
}
