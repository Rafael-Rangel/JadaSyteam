import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Rotas protegidas: exige login
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // /admin: só role admin pode acessar
  if (pathname.startsWith('/admin')) {
    const role = (token as { role?: string }).role;
    if (role !== 'admin') {
      const dashboard = new URL('/buyer/dashboard', request.url);
      return NextResponse.redirect(dashboard);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/buyer/:path*', '/seller/:path*', '/admin/:path*'],
};
