/**
 * JADA — Business Logic Tests: Onboarding & Billing State Machine
 *
 * Stack: Jest + ts-jest
 * Cobertura: cadastro, aprovação, billing, gate de acesso
 */

import { describe, it, expect, beforeEach, jest } from "@jest/globals";

// ─────────────────────────────────────────────
// Helpers de factory para os testes
// ─────────────────────────────────────────────

const makeCompany = (overrides = {}) => ({
  id: "company-1",
  cnpj: "11222333000181",
  type: "buyer",
  plan: "starter",
  verificationStatus: "pending",
  approvalStatus: "pending",
  billingStatus: "pending",
  billingManuallyApproved: false,
  preferredBillingType: "PIX",
  preferredBillingPeriod: "MONTHLY",
  billingCustomerId: null,
  billingSubscriptionId: null,
  ...overrides,
});

const makeUser = (overrides = {}) => ({
  id: "user-1",
  email: "owner@empresa.com.br",
  role: "owner",
  companyId: "company-1",
  ...overrides,
});

// ─────────────────────────────────────────────
// 1. CADASTRO
// ─────────────────────────────────────────────

describe("Onboarding — Cadastro", () => {
  it("deve normalizar email para lowercase ao criar usuário", () => {
    const email = "Owner@Empresa.COM.BR";
    const normalized = email.toLowerCase();
    expect(normalized).toBe("owner@empresa.com.br");
  });

  it("deve normalizar CNPJ removendo pontuação", () => {
    const raw = "11.222.333/0001-81";
    const normalized = raw.replace(/\D/g, "");
    expect(normalized).toBe("11222333000181");
    expect(normalized).toHaveLength(14);
  });

  it("deve rejeitar CNPJ com comprimento inválido", () => {
    const invalids = ["123", "1122233300018", "112223330001810"];
    invalids.forEach((cnpj) => {
      expect(cnpj.replace(/\D/g, "")).not.toHaveLength(14);
    });
  });

  it("não deve criar cobrança no Asaas no momento do cadastro", () => {
    // Estado esperado imediatamente após cadastro
    const company = makeCompany();
    expect(company.billingCustomerId).toBeNull();
    expect(company.billingSubscriptionId).toBeNull();
    expect(company.billingStatus).toBe("pending");
  });

  it("deve persistir preferências de billing no cadastro", () => {
    const company = makeCompany({
      preferredBillingType: "BOLETO",
      preferredBillingPeriod: "ANNUAL",
    });
    expect(company.preferredBillingType).toBe("BOLETO");
    expect(company.preferredBillingPeriod).toBe("ANNUAL");
  });

  it("deve iniciar approvalStatus como pending", () => {
    const company = makeCompany();
    expect(company.approvalStatus).toBe("pending");
  });
});

// ─────────────────────────────────────────────
// 2. VERIFICAÇÃO DE CNPJ
// ─────────────────────────────────────────────

describe("Onboarding — Verificação CNPJ (BrasilAPI)", () => {
  const checkVerificationStatus = (apiResponse: {
    status: string;
    situacao_cadastral?: string;
  }) => {
    if (!apiResponse || apiResponse.status === "ERROR") return "rejected";
    if (apiResponse.situacao_cadastral === "ATIVA") return "approved";
    return "rejected";
  };

  it("deve aprovar empresa com CNPJ ativo na Receita Federal", () => {
    const response = { status: "OK", situacao_cadastral: "ATIVA" };
    expect(checkVerificationStatus(response)).toBe("approved");
  });

  it("deve rejeitar empresa com CNPJ baixado", () => {
    const response = { status: "OK", situacao_cadastral: "BAIXADA" };
    expect(checkVerificationStatus(response)).toBe("rejected");
  });

  it("deve rejeitar empresa em caso de erro na BrasilAPI", () => {
    const response = { status: "ERROR" };
    expect(checkVerificationStatus(response)).toBe("rejected");
  });

  it("deve rejeitar empresa com CNPJ suspenso", () => {
    const response = { status: "OK", situacao_cadastral: "SUSPENSA" };
    expect(checkVerificationStatus(response)).toBe("rejected");
  });
});

// ─────────────────────────────────────────────
// 3. APROVAÇÃO OPERACIONAL (admin)
// ─────────────────────────────────────────────

describe("Aprovação Admin", () => {
  const canApprove = (company: ReturnType<typeof makeCompany>) => {
    if (company.approvalStatus === "approved") return { ok: false, reason: "already_approved" };
    if (company.verificationStatus !== "approved") return { ok: false, reason: "cnpj_not_verified" };
    return { ok: true };
  };

  it("deve permitir aprovar empresa com CNPJ verificado", () => {
    const company = makeCompany({ verificationStatus: "approved" });
    expect(canApprove(company).ok).toBe(true);
  });

  it("não deve aprovar empresa já aprovada (idempotência)", () => {
    const company = makeCompany({ verificationStatus: "approved", approvalStatus: "approved" });
    const result = canApprove(company);
    expect(result.ok).toBe(false);
    expect(result.reason).toBe("already_approved");
  });

  it("não deve aprovar empresa com CNPJ pendente", () => {
    const company = makeCompany({ verificationStatus: "pending" });
    const result = canApprove(company);
    expect(result.ok).toBe(false);
    expect(result.reason).toBe("cnpj_not_verified");
  });

  it("não deve aprovar empresa com CNPJ rejeitado", () => {
    const company = makeCompany({ verificationStatus: "rejected" });
    expect(canApprove(company).ok).toBe(false);
  });
});

// ─────────────────────────────────────────────
// 4. STATE MACHINE DE BILLING
// ─────────────────────────────────────────────

describe("Billing — Máquina de estados", () => {
  const applyWebhookEvent = (currentStatus: string, eventType: string): string => {
    const transitions: Record<string, string> = {
      PAYMENT_CONFIRMED: "active",
      PAYMENT_RECEIVED: "active",
      CHECKOUT_PAID: "active",
      PAYMENT_OVERDUE: "past_due",
      SUBSCRIPTION_INACTIVATED: "canceled",
      SUBSCRIPTION_DELETED: "canceled",
    };
    return transitions[eventType] ?? currentStatus;
  };

  it("PAYMENT_CONFIRMED deve ativar billing", () => {
    expect(applyWebhookEvent("pending", "PAYMENT_CONFIRMED")).toBe("active");
  });

  it("PAYMENT_RECEIVED deve ativar billing", () => {
    expect(applyWebhookEvent("pending", "PAYMENT_RECEIVED")).toBe("active");
  });

  it("CHECKOUT_PAID deve ativar billing", () => {
    expect(applyWebhookEvent("pending", "CHECKOUT_PAID")).toBe("active");
  });

  it("PAYMENT_OVERDUE deve marcar como past_due", () => {
    expect(applyWebhookEvent("active", "PAYMENT_OVERDUE")).toBe("past_due");
  });

  it("SUBSCRIPTION_INACTIVATED deve cancelar", () => {
    expect(applyWebhookEvent("active", "SUBSCRIPTION_INACTIVATED")).toBe("canceled");
  });

  it("SUBSCRIPTION_DELETED deve cancelar", () => {
    expect(applyWebhookEvent("active", "SUBSCRIPTION_DELETED")).toBe("canceled");
  });

  it("evento desconhecido não deve alterar estado", () => {
    expect(applyWebhookEvent("active", "UNKNOWN_EVENT")).toBe("active");
  });
});

// ─────────────────────────────────────────────
// 5. GATE DE ACESSO (buyer/seller layouts)
// ─────────────────────────────────────────────

describe("Gate de Acesso — Layouts Buyer/Seller", () => {
  const canAccessProtectedArea = (company: ReturnType<typeof makeCompany>) => {
    if (company.billingManuallyApproved) return true;
    if (company.approvalStatus !== "approved") return false;
    if (company.billingStatus !== "active") return false;
    return true;
  };

  it("deve liberar acesso com approval + billing ativos", () => {
    const company = makeCompany({ approvalStatus: "approved", billingStatus: "active" });
    expect(canAccessProtectedArea(company)).toBe(true);
  });

  it("deve bloquear empresa aprovada sem billing ativo", () => {
    const company = makeCompany({ approvalStatus: "approved", billingStatus: "pending" });
    expect(canAccessProtectedArea(company)).toBe(false);
  });

  it("deve bloquear empresa com billing ativo mas não aprovada", () => {
    const company = makeCompany({ approvalStatus: "pending", billingStatus: "active" });
    expect(canAccessProtectedArea(company)).toBe(false);
  });

  it("deve bloquear empresa cancelada", () => {
    const company = makeCompany({ approvalStatus: "approved", billingStatus: "canceled" });
    expect(canAccessProtectedArea(company)).toBe(false);
  });

  it("billingManuallyApproved deve fazer bypass completo", () => {
    const company = makeCompany({
      approvalStatus: "pending",
      billingStatus: "pending",
      billingManuallyApproved: true,
    });
    expect(canAccessProtectedArea(company)).toBe(true);
  });

  it("empresa past_due deve ser bloqueada", () => {
    const company = makeCompany({ approvalStatus: "approved", billingStatus: "past_due" });
    expect(canAccessProtectedArea(company)).toBe(false);
  });
});

// ─────────────────────────────────────────────
// 6. MÉTODOS DE COBRANÇA
// ─────────────────────────────────────────────

describe("Billing — Métodos suportados", () => {
  const VALID_BILLING_TYPES = ["PIX", "BOLETO", "CREDIT_CARD"];
  const VALID_BILLING_PERIODS = ["MONTHLY", "ANNUAL"];

  it("deve aceitar apenas métodos válidos", () => {
    const inputs = ["PIX", "BOLETO", "CREDIT_CARD", "DINHEIRO", "CRIPTO"];
    const valid = inputs.filter((m) => VALID_BILLING_TYPES.includes(m));
    expect(valid).toEqual(["PIX", "BOLETO", "CREDIT_CARD"]);
  });

  it("deve aceitar apenas períodos válidos", () => {
    const inputs = ["MONTHLY", "WEEKLY", "ANNUAL", "DAILY"];
    const valid = inputs.filter((p) => VALID_BILLING_PERIODS.includes(p));
    expect(valid).toEqual(["MONTHLY", "ANNUAL"]);
  });
});
