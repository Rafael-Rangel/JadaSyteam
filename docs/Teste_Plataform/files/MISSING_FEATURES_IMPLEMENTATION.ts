/**
 * JADA — Implementação das Funcionalidades Ausentes
 *
 * Este arquivo contém o CÓDIGO DE REFERÊNCIA para implementar
 * as funcionalidades identificadas como ausentes na auditoria.
 *
 * MISS-01: Mudança de plano pelo usuário
 * MISS-02: Cancelamento de assinatura pelo usuário
 * MISS-03: Mudança de método de pagamento
 * MISS-07: Soft delete de usuário (JWT revogação)
 * FIX-B01: Verificação de billingStatus nas APIs de negócio
 * FIX-H02: Idempotência de assinatura no Asaas
 * FIX-A08: Rate limiting em auth
 */

// ─────────────────────────────────────────────────────────────────────────────
// MISS-01: Mudança de Plano
// Arquivo sugerido: app/api/company/plan/route.ts
// ─────────────────────────────────────────────────────────────────────────────

/*
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.companyId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { planSlug } = await req.json();

  // 1. Validar plano destino
  const targetPlan = await prisma.plan.findUnique({ where: { slug: planSlug } });
  if (!targetPlan) {
    return Response.json({ error: "Plano não encontrado" }, { status: 404 });
  }

  // 2. Buscar empresa atual
  const company = await prisma.company.findUnique({
    where: { id: session.user.companyId },
  });
  if (!company) return Response.json({ error: "Empresa não encontrada" }, { status: 404 });
  if (company.plan === planSlug) {
    return Response.json({ error: "Empresa já está neste plano" }, { status: 400 });
  }

  // 3. Verificar downgrade: usuários atuais > novo limite?
  const currentUserCount = await prisma.user.count({
    where: { companyId: company.id },
  });
  if (currentUserCount > targetPlan.usersLimit) {
    return Response.json({
      error: `Downgrade não permitido: empresa tem ${currentUserCount} usuários, novo plano permite ${targetPlan.usersLimit}`,
    }, { status: 400 });
  }

  // 4. Atualizar assinatura no Asaas (se houver)
  if (company.billingSubscriptionId) {
    try {
      await asaasClient.put(`/subscriptions/${company.billingSubscriptionId}`, {
        value: targetPlan.price,
        description: `Plano JADA ${targetPlan.slug}`,
      });
    } catch (err) {
      return Response.json({ error: "Falha ao atualizar assinatura no provedor de pagamento" }, { status: 500 });
    }
  }

  // 5. Atualizar plano no banco
  const updated = await prisma.company.update({
    where: { id: company.id },
    data: { plan: planSlug },
    select: { id: true, plan: true },
  });

  return Response.json({ ok: true, plan: updated.plan });
}
*/

// ─────────────────────────────────────────────────────────────────────────────
// MISS-02: Cancelamento de Assinatura
// Arquivo sugerido: app/api/company/subscription/cancel/route.ts
// ─────────────────────────────────────────────────────────────────────────────

/*
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.companyId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const company = await prisma.company.findUnique({
    where: { id: session.user.companyId },
    select: { billingSubscriptionId: true, billingStatus: true },
  });

  if (!company?.billingSubscriptionId) {
    return Response.json({ error: "Sem assinatura ativa" }, { status: 400 });
  }

  if (company.billingStatus === "canceled") {
    return Response.json({ error: "Assinatura já cancelada" }, { status: 400 });
  }

  // Cancelar no Asaas
  try {
    await asaasClient.delete(`/subscriptions/${company.billingSubscriptionId}`);
  } catch (err) {
    return Response.json({ error: "Falha ao cancelar no provedor" }, { status: 500 });
  }

  // Atualizar status local
  await prisma.company.update({
    where: { id: session.user.companyId },
    data: { billingStatus: "canceled" },
  });

  // Registrar evento de auditoria
  await prisma.billingEvent.create({
    data: {
      companyId: session.user.companyId,
      provider: "asaas",
      eventType: "SUBSCRIPTION_CANCELED_BY_USER",
      externalId: company.billingSubscriptionId,
      payload: { canceledBy: session.user.id, at: new Date().toISOString() },
    },
  });

  return Response.json({ ok: true });
}
*/

// ─────────────────────────────────────────────────────────────────────────────
// FIX-B01: Middleware de billing para APIs de negócio
// Arquivo sugerido: lib/requireActiveBilling.ts
// Usar em: /api/requests, /api/proposals/create, /api/proposals/accept
// ─────────────────────────────────────────────────────────────────────────────

/*
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function requireActiveBilling(req: Request): Promise<
  { ok: true; company: { id: string; type: string; plan: string } } |
  { ok: false; response: Response }
> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.companyId) {
    return {
      ok: false,
      response: Response.json({ error: "Não autenticado" }, { status: 401 }),
    };
  }

  const company = await prisma.company.findUnique({
    where: { id: session.user.companyId },
    select: {
      id: true,
      type: true,
      plan: true,
      approvalStatus: true,
      billingStatus: true,
      billingManuallyApproved: true,
      verificationStatus: true,
    },
  });

  if (!company) {
    return {
      ok: false,
      response: Response.json({ error: "Empresa não encontrada" }, { status: 404 }),
    };
  }

  const isActive =
    company.billingManuallyApproved ||
    (company.approvalStatus === "approved" && company.billingStatus === "active");

  if (!isActive) {
    return {
      ok: false,
      response: Response.json(
        { error: "Acesso bloqueado. Aguardando aprovação ou pagamento." },
        { status: 403 }
      ),
    };
  }

  return { ok: true, company };
}

// USO em um route handler:
// export async function POST(req: Request) {
//   const access = await requireActiveBilling(req);
//   if (!access.ok) return access.response;
//   const { company } = access;
//   // ... lógica do handler
// }
*/

// ─────────────────────────────────────────────────────────────────────────────
// FIX-H02: Idempotência de assinatura Asaas
// Arquivo: lib/asaasBilling.ts (adicionar verificação antes de criar)
// ─────────────────────────────────────────────────────────────────────────────

/*
export async function createBillingForCompany(companyId: string) {
  const company = await prisma.company.findUnique({ where: { id: companyId } });
  if (!company) throw new Error("Empresa não encontrada");

  // ─── IDEMPOTÊNCIA: já tem subscription? retornar existente ───
  if (company.billingSubscriptionId) {
    console.log(`[Billing] Empresa ${companyId} já tem subscription: ${company.billingSubscriptionId}`);
    return { alreadyExists: true, subscriptionId: company.billingSubscriptionId };
  }

  // ─── Criar customer se não existir ───────────────────────────
  let customerId = company.billingCustomerId;
  if (!customerId) {
    const customer = await asaasClient.post("/customers", {
      name: company.name,
      cpfCnpj: company.cnpj,
      email: company.ownerEmail,
      phone: company.phone,
    });
    customerId = customer.data.id;
    await prisma.company.update({
      where: { id: companyId },
      data: { billingCustomerId: customerId },
    });
  }

  // ─── Criar subscription ──────────────────────────────────────
  const subscription = await asaasClient.post("/subscriptions", {
    customer: customerId,
    billingType: company.preferredBillingType,
    value: plan.price,
    cycle: company.preferredBillingPeriod === "MONTHLY" ? "MONTHLY" : "YEARLY",
    description: `JADA - Plano ${company.plan}`,
  });

  await prisma.company.update({
    where: { id: companyId },
    data: { billingSubscriptionId: subscription.data.id },
  });

  return { alreadyExists: false, subscriptionId: subscription.data.id };
}
*/

// ─────────────────────────────────────────────────────────────────────────────
// FIX-H08: Deduplicação de eventos webhook
// Arquivo: app/api/webhooks/asaas/route.ts
// ─────────────────────────────────────────────────────────────────────────────

/*
export async function POST(req: Request) {
  const token = req.headers.get("asaas-access-token");
  if (token !== process.env.ASAAS_WEBHOOK_TOKEN) {
    return Response.json({ error: "Unauthorized" }, { status: 403 });
  }

  const event = await req.json();
  const externalId = event?.payment?.id ?? event?.subscription?.id ?? "unknown";
  const eventType = event?.event ?? "UNKNOWN";

  // ─── DEDUPLICAÇÃO: verificar se evento já foi processado ─────
  const existing = await prisma.billingEvent.findFirst({
    where: { externalId, eventType },
  });

  if (existing) {
    console.log(`[Webhook] Evento duplicado ignorado: ${eventType} / ${externalId}`);
    return Response.json({ ok: true, deduplicated: true });
  }

  // ─── Processar evento ─────────────────────────────────────────
  // ... lógica existente

  // ─── Registrar no audit trail ────────────────────────────────
  await prisma.billingEvent.create({
    data: {
      companyId: company.id,
      provider: "asaas",
      eventType,
      externalId,
      payload: event,
    },
  });

  return Response.json({ ok: true });
}
*/

// ─────────────────────────────────────────────────────────────────────────────
// FIX-D02: Whitelist explícita no PATCH /api/company
// Arquivo: app/api/company/route.ts
// ─────────────────────────────────────────────────────────────────────────────

/*
// Campos que o usuário PODE editar
const USER_EDITABLE_FIELDS = [
  "name",
  "phone",
  "address",
  "website",
  "description",
  "preferredBillingType",    // apenas atualiza preferência — não recria assinatura
  "preferredBillingPeriod",  // idem
] as const;

// Campos NUNCA editáveis pelo usuário via API
const PROTECTED_FIELDS = [
  "approvalStatus",
  "billingStatus",
  "billingManuallyApproved",
  "verificationStatus",
  "billingCustomerId",
  "billingSubscriptionId",
  "plan",    // mudança de plano tem endpoint próprio
  "type",    // tipo de empresa não muda sem reaprovação
  "role",
  "cnpj",
];

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.companyId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  // Remover TODOS os campos protegidos do body
  const sanitized = Object.fromEntries(
    Object.entries(body).filter(([key]) =>
      USER_EDITABLE_FIELDS.includes(key as any)
    )
  );

  if (Object.keys(sanitized).length === 0) {
    return Response.json({ error: "Nenhum campo editável fornecido" }, { status: 400 });
  }

  const updated = await prisma.company.update({
    where: { id: session.user.companyId },
    data: sanitized,
  });

  return Response.json(updated);
}
*/

// ─────────────────────────────────────────────────────────────────────────────
// FIX-A08: Rate Limiting em Auth
// Arquivo: app/api/auth/signup/route.ts e forgot-password/route.ts
// Dependência: npm install @upstash/ratelimit @upstash/redis
// ─────────────────────────────────────────────────────────────────────────────

/*
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Inicializar fora do handler (singleton)
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "60 s"), // 5 tentativas por minuto por IP
  analytics: true,
  prefix: "jada:auth",
});

function getClientIP(req: Request): string {
  return (
    req.headers.get("x-real-ip") ??
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    "127.0.0.1"
  );
}

export async function POST(req: Request) {
  const ip = getClientIP(req);
  const { success, limit, remaining, reset } = await ratelimit.limit(ip);

  if (!success) {
    return Response.json(
      { error: "Muitas tentativas. Tente novamente em alguns minutos." },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": String(limit),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(reset),
          "Retry-After": String(Math.ceil((reset - Date.now()) / 1000)),
        },
      }
    );
  }

  // ... resto do handler
}
*/

export {}; // evitar erro de módulo vazio
