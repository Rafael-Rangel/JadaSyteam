import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Resend } from 'resend';
import crypto from 'crypto';
import { getRequestRateKey, rateLimitByKey } from '@/lib/rateLimit';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(request: NextRequest) {
  const limiter = rateLimitByKey(`forgot-password:${getRequestRateKey(request)}`, 8, 60_000);
  if (!limiter.allowed) {
    return NextResponse.json(
      { error: 'Muitas tentativas. Aguarde alguns instantes.' },
      { status: 429 }
    );
  }
  const body = await request.json();
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  if (!email) {
    return NextResponse.json({ error: 'E-mail é obrigatório.' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json(
      { message: 'Se esse e-mail estiver cadastrado, você receberá um link para redefinir sua senha.' }
    );
  }

  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });
  await prisma.passwordResetToken.create({
    data: { token, userId: user.id, expiresAt },
  });

  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const resetLink = `${baseUrl}/reset-password?token=${token}`;

  if (!resend) {
    return NextResponse.json(
      { error: 'Envio de e-mail não configurado. Defina RESEND_API_KEY no servidor.' },
      { status: 503 }
    );
  }

  const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

  const { error } = await resend.emails.send({
    from: fromEmail,
    to: user.email,
    subject: 'Redefinição de senha - JADA',
    html: `
      <p>Olá, ${user.name || 'usuário'}!</p>
      <p>Você solicitou a redefinição de senha na plataforma JADA.</p>
      <p>Clique no link abaixo para definir uma nova senha (válido por 1 hora):</p>
      <p><a href="${resetLink}">${resetLink}</a></p>
      <p>Se você não solicitou isso, ignore este e-mail.</p>
      <p>— Equipe JADA</p>
    `,
  });

  if (error) {
    return NextResponse.json(
      { error: 'Não foi possível enviar o e-mail. Tente novamente mais tarde.' },
      { status: 500 }
    );
  }

  return NextResponse.json({
    message: 'Se esse e-mail estiver cadastrado, você receberá um link para redefinir sua senha.',
  });
}
