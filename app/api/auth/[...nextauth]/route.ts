import NextAuth from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { getRequestRateKey, rateLimitByKey } from '@/lib/rateLimit';

const handler = NextAuth(authOptions);

export const GET = handler;

export async function POST(
  request: Request,
  context: { params: { nextauth: string[] } }
) {
  const url = new URL(request.url);
  if (url.pathname.endsWith('/callback/credentials')) {
    const limiter = rateLimitByKey(`auth-login:${getRequestRateKey(request)}`, 20, 60_000);
    if (!limiter.allowed) {
      return NextResponse.json(
        { error: 'Muitas tentativas de login. Aguarde alguns instantes.' },
        { status: 429 }
      );
    }
  }

  return (handler as unknown as (req: Request, ctx: { params: { nextauth: string[] } }) => Response)(
    request,
    context
  );
}
