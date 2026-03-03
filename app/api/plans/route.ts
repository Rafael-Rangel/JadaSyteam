import { NextResponse } from 'next/server';
import { getActivePlans } from '@/lib/planService';

/**
 * GET /api/plans - Lista planos ativos (público). Usado por /plans e /signup.
 */
export async function GET() {
  const plans = await getActivePlans();
  return NextResponse.json(plans);
}
