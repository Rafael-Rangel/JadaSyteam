import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

type AuthToken = {
  role?: string;
  actingCompanyId?: string | null;
};

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const token = (await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })) as AuthToken | null;

  if (!token) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  const role = token.role;

  if (pathname.startsWith('/admin')) {
    if (role !== 'admin') {
      const dest =
        role === 'assistant' ? '/assistant' : new URL('/buyer/dashboard', request.url);
      return NextResponse.redirect(dest);
    }
  }

  if (pathname.startsWith('/assistant')) {
    if (role !== 'assistant') {
      if (role === 'admin') {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      }
      return NextResponse.redirect(new URL('/buyer/dashboard', request.url));
    }
  }

  if (role === 'assistant') {
    const acting = token.actingCompanyId;
    if (
      (pathname.startsWith('/buyer') || pathname.startsWith('/seller')) &&
      !acting
    ) {
      return NextResponse.redirect(new URL('/assistant', request.url));
    }
    if (pathname.startsWith('/aguardando-pagamento')) {
      return NextResponse.redirect(new URL('/assistant', request.url));
    }
  }

  const response = NextResponse.next();
  response.headers.set('Cache-Control', 'no-store, max-age=0');
  response.headers.set('Pragma', 'no-cache');
  return response;
}

export const config = {
  matcher: [
    '/buyer/:path*',
    '/seller/:path*',
    '/admin/:path*',
    '/assistant/:path*',
    '/aguardando-pagamento',
  ],
};
