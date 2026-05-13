import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { normalizeCnpj, isValidCnpjFormat } from '@/lib/cnpjVerification';
import { getRequestRateKey, rateLimitByKey } from '@/lib/rateLimit';
import { enforceSameOrigin } from '@/lib/apiSecurity';

/**
 * Verifica e-mail e CNPJ antes de avançar no cadastro (evita surpresa só no envio final).
 */
export async function POST(request: Request) {
  const sameOriginError = enforceSameOrigin(request);
  if (sameOriginError) return sameOriginError;

  const limiter = rateLimitByKey(`check-signup:${getRequestRateKey(request)}`, 40, 60_000);
  if (!limiter.allowed) {
    return NextResponse.json(
      { error: 'Muitas verificações. Aguarde um instante e tente novamente.' },
      { status: 429 }
    );
  }

  let body: { email?: string; cnpj?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido.' }, { status: 400 });
  }

  const emailRaw = typeof body.email === 'string' ? body.email.trim() : '';
  const cnpjRaw = typeof body.cnpj === 'string' ? body.cnpj.trim() : '';

  if (!emailRaw || !/\S+@\S+\.\S+/.test(emailRaw)) {
    return NextResponse.json({ error: 'Informe um e-mail válido.' }, { status: 400 });
  }
  if (!cnpjRaw || !isValidCnpjFormat(cnpjRaw)) {
    return NextResponse.json({ error: 'Informe um CNPJ válido (14 dígitos).' }, { status: 400 });
  }

  const email = emailRaw.toLowerCase();
  const cnpj = normalizeCnpj(cnpjRaw);

  const [userByEmail, companyByCnpj] = await Promise.all([
    prisma.user.findUnique({ where: { email }, select: { id: true } }),
    prisma.company.findFirst({ where: { cnpj }, select: { id: true } }),
  ]);

  const emailTaken = Boolean(userByEmail);
  const cnpjTaken = Boolean(companyByCnpj);

  return NextResponse.json({
    ok: !emailTaken && !cnpjTaken,
    emailTaken,
    cnpjTaken,
  });
}
