import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export const authOptions: NextAuthOptions = {
  pages: {
    signIn: '/login',
  },
  useSecureCookies: process.env.NODE_ENV === 'production',
  session: {
    strategy: 'jwt',
    maxAge: 12 * 60 * 60, // 12h
    updateAge: 60 * 60, // renew every hour
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.companyId = (user as { companyId?: string }).companyId;
        token.role = (user as { role?: string }).role;
        token.companyType = (user as { companyType?: string }).companyType;
        token.restrictToAssignedCompanies = (
          user as { restrictToAssignedCompanies?: boolean }
        ).restrictToAssignedCompanies;
        if ((user as { role?: string }).role === 'assistant') {
          token.actingCompanyId = null;
          token.actingCompanyType = null;
        }
      }

      if (trigger === 'update' && session) {
        const s = session as {
          actingCompanyId?: string | null;
          actingCompanyType?: string | null;
        };
        if (token.role === 'assistant') {
          if (s.actingCompanyId === null) {
            token.actingCompanyId = null;
            token.actingCompanyType = null;
          } else if (typeof s.actingCompanyId === 'string' && token.id) {
            const { assertAssistantCanAccessCompany } = await import('@/lib/sessionContext');
            const access = await assertAssistantCanAccessCompany({
              assistantUserId: token.id as string,
              companyId: s.actingCompanyId,
              restrictToAssignedCompanies: token.restrictToAssignedCompanies !== false,
            });
            if (access.ok) {
              token.actingCompanyId = s.actingCompanyId;
              token.actingCompanyType =
                typeof s.actingCompanyType === 'string' ? s.actingCompanyType : null;
            }
          }
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.id as string;
        (session.user as { companyId?: string }).companyId = token.companyId as string;
        (session.user as { role?: string }).role = token.role as string;
        (session.user as { companyType?: string }).companyType = token.companyType as string;
        (session.user as { restrictToAssignedCompanies?: boolean }).restrictToAssignedCompanies =
          token.restrictToAssignedCompanies as boolean;
        (session.user as { actingCompanyId?: string | null }).actingCompanyId =
          (token.actingCompanyId as string | null) ?? null;
        (session.user as { actingCompanyType?: string | null }).actingCompanyType =
          (token.actingCompanyType as string | null) ?? null;
      }
      return session;
    },
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'E-mail', type: 'email' },
        password: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const email = credentials.email.trim().toLowerCase();
        const user = await prisma.user.findUnique({
          where: { email },
          include: { company: true },
        });
        if (!user) return null;
        if (user.deletedAt) return null;
        const valid = await bcrypt.compare(credentials.password, user.password);
        if (!valid) return null;
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          companyId: user.companyId,
          role: user.role,
          companyType: user.company.type,
          restrictToAssignedCompanies: user.restrictToAssignedCompanies,
        };
      },
    }),
  ],
};
