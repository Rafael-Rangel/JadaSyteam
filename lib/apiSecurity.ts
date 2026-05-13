import { NextResponse } from 'next/server';

/** Primeiro valor de cabeçalhos que podem vir como lista (proxy). */
function headerFirst(request: Request, name: string): string | null {
  const raw = request.headers.get(name);
  if (!raw) return null;
  return raw.split(',')[0]?.trim() || null;
}

/**
 * Verifica se o header Origin corresponde ao site público.
 * Atrás de reverse proxy, `request.url` costuma ser interno (ex.: http://127.0.0.1:3000),
 * então comparamos Origin com X-Forwarded-Host/Proto ou com NEXTAUTH_URL.
 */
function originMatchesApp(request: Request, originUrl: URL): boolean {
  const forwardedHost = headerFirst(request, 'x-forwarded-host');
  const forwardedProto = headerFirst(request, 'x-forwarded-proto');
  if (forwardedHost && forwardedProto) {
    const proto = forwardedProto.replace(/:$/, '');
    if (originUrl.host === forwardedHost && originUrl.protocol === `${proto}:`) {
      return true;
    }
  }

  const nextAuth = process.env.NEXTAUTH_URL;
  if (nextAuth) {
    try {
      const app = new URL(nextAuth);
      if (originUrl.host === app.host && originUrl.protocol === app.protocol) {
        return true;
      }
    } catch {
      /* ignore */
    }
  }

  const requestUrl = new URL(request.url);
  return requestUrl.host === originUrl.host && requestUrl.protocol === originUrl.protocol;
}

export function enforceSameOrigin(request: Request): NextResponse | null {
  const method = request.method.toUpperCase();
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') return null;

  const origin = request.headers.get('origin');
  if (!origin) return null;

  let originUrl: URL;
  try {
    originUrl = new URL(origin);
  } catch {
    return NextResponse.json({ error: 'Origem inválida.' }, { status: 403 });
  }

  if (!originMatchesApp(request, originUrl)) {
    return NextResponse.json({ error: 'Origem inválida.' }, { status: 403 });
  }
  return null;
}

export function withNoStore(response: NextResponse): NextResponse {
  response.headers.set('Cache-Control', 'no-store, max-age=0');
  response.headers.set('Pragma', 'no-cache');
  return response;
}
