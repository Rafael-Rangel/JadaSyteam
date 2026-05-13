import { NextResponse } from 'next/server';

export function enforceSameOrigin(request: Request): NextResponse | null {
  const method = request.method.toUpperCase();
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') return null;

  const origin = request.headers.get('origin');
  if (!origin) return null;

  const requestUrl = new URL(request.url);
  const originUrl = new URL(origin);
  if (requestUrl.host !== originUrl.host || requestUrl.protocol !== originUrl.protocol) {
    return NextResponse.json({ error: 'Origem inválida.' }, { status: 403 });
  }
  return null;
}

export function withNoStore(response: NextResponse): NextResponse {
  response.headers.set('Cache-Control', 'no-store, max-age=0');
  response.headers.set('Pragma', 'no-cache');
  return response;
}
