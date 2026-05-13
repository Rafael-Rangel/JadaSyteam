import { NextResponse } from 'next/server';

/**
 * Cobrança é emitida pela plataforma (aprovação admin / Asaas). Usuário não dispara nova assinatura por aqui.
 */
export async function POST() {
  return NextResponse.json(
    {
      error:
        'A emissão de cobrança é feita automaticamente pela plataforma. Use Assinatura para renovar ou ajustar o plano na janela permitida.',
    },
    { status: 403 }
  );
}
