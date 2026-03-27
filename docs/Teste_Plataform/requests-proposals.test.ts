/**
 * JADA — Business Logic Tests: Requests, Proposals & Plan Limits
 *
 * Stack: Jest + ts-jest
 * Cobertura: criação de requests, propostas, limites de plano
 */

import { describe, it, expect } from "@jest/globals";

// ─────────────────────────────────────────────
// Factories
// ─────────────────────────────────────────────

const makeCompany = (overrides = {}) => ({
  id: "company-1",
  type: "buyer",
  plan: "starter",
  verificationStatus: "approved",
  approvalStatus: "approved",
  billingStatus: "active",
  ...overrides,
});

const makePlan = (overrides = {}) => ({
  slug: "starter",
  usersLimit: 3,
  requestsPerMonthLimit: 10,
  proposalsPerMonthLimit: 20,
  ...overrides,
});

const makeRequest = (overrides = {}) => ({
  id: "req-1",
  buyerId: "company-1",
  status: "open",
  isPublic: true,
  ...overrides,
});

const makeProposal = (overrides = {}) => ({
  id: "prop-1",
  requestId: "req-1",
  sellerId: "company-2",
  status: "sent",
  ...overrides,
});

// ─────────────────────────────────────────────
// 1. ELEGIBILIDADE PARA CRIAR REQUEST
// ─────────────────────────────────────────────

describe("Requests — Elegibilidade de criação", () => {
  const canCreateRequest = (company: ReturnType<typeof makeCompany>) => {
    if (!["buyer", "both"].includes(company.type)) {
      return { ok: false, reason: "not_buyer" };
    }
    if (company.verificationStatus !== "approved") {
      return { ok: false, reason: "cnpj_not_approved" };
    }
    if (company.approvalStatus !== "approved" || company.billingStatus !== "active") {
      return { ok: false, reason: "not_active" };
    }
    return { ok: true };
  };

  it("buyer ativo pode criar request", () => {
    const company = makeCompany({ type: "buyer" });
    expect(canCreateRequest(company).ok).toBe(true);
  });

  it("empresa 'both' pode criar request", () => {
    const company = makeCompany({ type: "both" });
    expect(canCreateRequest(company).ok).toBe(true);
  });

  it("seller puro não pode criar request", () => {
    const company = makeCompany({ type: "seller" });
    const result = canCreateRequest(company);
    expect(result.ok).toBe(false);
    expect(result.reason).toBe("not_buyer");
  });

  it("buyer com CNPJ pendente não pode criar request", () => {
    const company = makeCompany({ verificationStatus: "pending" });
    const result = canCreateRequest(company);
    expect(result.ok).toBe(false);
    expect(result.reason).toBe("cnpj_not_approved");
  });

  it("buyer com billing inativo não pode criar request", () => {
    const company = makeCompany({ billingStatus: "past_due" });
    const result = canCreateRequest(company);
    expect(result.ok).toBe(false);
    expect(result.reason).toBe("not_active");
  });
});

// ─────────────────────────────────────────────
// 2. ELEGIBILIDADE PARA CRIAR PROPOSAL
// ─────────────────────────────────────────────

describe("Proposals — Elegibilidade de criação", () => {
  const canCreateProposal = (
    company: ReturnType<typeof makeCompany>,
    request: ReturnType<typeof makeRequest>,
    existingProposals: ReturnType<typeof makeProposal>[]
  ) => {
    if (!["seller", "both"].includes(company.type)) {
      return { ok: false, reason: "not_seller" };
    }
    if (company.verificationStatus !== "approved") {
      return { ok: false, reason: "cnpj_not_approved" };
    }
    if (company.approvalStatus !== "approved" || company.billingStatus !== "active") {
      return { ok: false, reason: "not_active" };
    }
    // Vendedor não pode propor para própria request
    if (request.buyerId === company.id) {
      return { ok: false, reason: "own_request" };
    }
    // Não pode duplicar proposta
    const alreadyProposed = existingProposals.some(
      (p) => p.requestId === request.id && p.sellerId === company.id
    );
    if (alreadyProposed) {
      return { ok: false, reason: "duplicate_proposal" };
    }
    return { ok: true };
  };

  it("seller ativo pode criar proposta", () => {
    const company = makeCompany({ id: "company-2", type: "seller" });
    const request = makeRequest({ buyerId: "company-1" });
    expect(canCreateProposal(company, request, []).ok).toBe(true);
  });

  it("empresa 'both' pode criar proposta", () => {
    const company = makeCompany({ id: "company-2", type: "both" });
    const request = makeRequest({ buyerId: "company-1" });
    expect(canCreateProposal(company, request, []).ok).toBe(true);
  });

  it("buyer puro não pode criar proposta", () => {
    const company = makeCompany({ id: "company-2", type: "buyer" });
    const request = makeRequest({ buyerId: "company-1" });
    const result = canCreateProposal(company, request, []);
    expect(result.ok).toBe(false);
    expect(result.reason).toBe("not_seller");
  });

  it("vendedor não pode propor para própria request", () => {
    const company = makeCompany({ id: "company-1", type: "both" });
    const request = makeRequest({ buyerId: "company-1" });
    const result = canCreateProposal(company, request, []);
    expect(result.ok).toBe(false);
    expect(result.reason).toBe("own_request");
  });

  it("não deve permitir proposta duplicada da mesma empresa", () => {
    const company = makeCompany({ id: "company-2", type: "seller" });
    const request = makeRequest({ buyerId: "company-1" });
    const existing = [makeProposal({ sellerId: "company-2", requestId: "req-1" })];
    const result = canCreateProposal(company, request, existing);
    expect(result.ok).toBe(false);
    expect(result.reason).toBe("duplicate_proposal");
  });

  it("deve permitir proposta de empresa diferente para mesma request", () => {
    const company = makeCompany({ id: "company-3", type: "seller" });
    const request = makeRequest({ buyerId: "company-1" });
    const existing = [makeProposal({ sellerId: "company-2", requestId: "req-1" })];
    expect(canCreateProposal(company, request, existing).ok).toBe(true);
  });
});

// ─────────────────────────────────────────────
// 3. ACEITE DE PROPOSTA
// ─────────────────────────────────────────────

describe("Proposals — Aceite", () => {
  const canAcceptProposal = (
    actor: { companyId: string },
    request: ReturnType<typeof makeRequest>
  ) => {
    if (actor.companyId !== request.buyerId) {
      return { ok: false, reason: "not_request_owner" };
    }
    if (request.status !== "open" && request.status !== "receiving") {
      return { ok: false, reason: "request_not_open" };
    }
    return { ok: true };
  };

  it("comprador dono da request pode aceitar proposta", () => {
    const actor = { companyId: "company-1" };
    const request = makeRequest({ buyerId: "company-1", status: "open" });
    expect(canAcceptProposal(actor, request).ok).toBe(true);
  });

  it("terceiro não pode aceitar proposta de outra empresa", () => {
    const actor = { companyId: "company-2" };
    const request = makeRequest({ buyerId: "company-1" });
    const result = canAcceptProposal(actor, request);
    expect(result.ok).toBe(false);
    expect(result.reason).toBe("not_request_owner");
  });

  it("não deve aceitar proposta de request fechada", () => {
    const actor = { companyId: "company-1" };
    const request = makeRequest({ buyerId: "company-1", status: "closed" });
    const result = canAcceptProposal(actor, request);
    expect(result.ok).toBe(false);
    expect(result.reason).toBe("request_not_open");
  });

  it("deve permitir aceite em request com status 'receiving'", () => {
    const actor = { companyId: "company-1" };
    const request = makeRequest({ buyerId: "company-1", status: "receiving" });
    expect(canAcceptProposal(actor, request).ok).toBe(true);
  });
});

// ─────────────────────────────────────────────
// 4. LIMITES DE PLANO
// ─────────────────────────────────────────────

describe("Plan Limits — Validação em runtime", () => {
  const checkUsersLimit = (plan: ReturnType<typeof makePlan>, currentCount: number) => {
    if (currentCount >= plan.usersLimit) {
      return { ok: false, reason: "users_limit_reached", limit: plan.usersLimit };
    }
    return { ok: true };
  };

  const checkRequestsLimit = (plan: ReturnType<typeof makePlan>, monthCount: number) => {
    if (monthCount >= plan.requestsPerMonthLimit) {
      return { ok: false, reason: "requests_limit_reached", limit: plan.requestsPerMonthLimit };
    }
    return { ok: true };
  };

  const checkProposalsLimit = (plan: ReturnType<typeof makePlan>, monthCount: number) => {
    if (monthCount >= plan.proposalsPerMonthLimit) {
      return { ok: false, reason: "proposals_limit_reached", limit: plan.proposalsPerMonthLimit };
    }
    return { ok: true };
  };

  it("deve permitir criar usuário abaixo do limite", () => {
    const plan = makePlan({ usersLimit: 3 });
    expect(checkUsersLimit(plan, 2).ok).toBe(true);
  });

  it("deve bloquear criação de usuário no limite", () => {
    const plan = makePlan({ usersLimit: 3 });
    const result = checkUsersLimit(plan, 3);
    expect(result.ok).toBe(false);
    expect(result.reason).toBe("users_limit_reached");
  });

  it("deve bloquear criação de request no limite mensal", () => {
    const plan = makePlan({ requestsPerMonthLimit: 10 });
    const result = checkRequestsLimit(plan, 10);
    expect(result.ok).toBe(false);
    expect(result.reason).toBe("requests_limit_reached");
  });

  it("deve permitir request abaixo do limite mensal", () => {
    const plan = makePlan({ requestsPerMonthLimit: 10 });
    expect(checkRequestsLimit(plan, 9).ok).toBe(true);
  });

  it("deve bloquear proposta quando limite mensal atingido", () => {
    const plan = makePlan({ proposalsPerMonthLimit: 20 });
    const result = checkProposalsLimit(plan, 20);
    expect(result.ok).toBe(false);
    expect(result.reason).toBe("proposals_limit_reached");
  });

  it("limite zerado deve bloquear toda criação", () => {
    const plan = makePlan({ usersLimit: 0 });
    expect(checkUsersLimit(plan, 0).ok).toBe(false);
  });

  describe("Planos com limites diferentes", () => {
    const plans = [
      { slug: "starter", usersLimit: 3, requestsPerMonthLimit: 10, proposalsPerMonthLimit: 20 },
      { slug: "pro", usersLimit: 10, requestsPerMonthLimit: 50, proposalsPerMonthLimit: 100 },
      { slug: "enterprise", usersLimit: 999, requestsPerMonthLimit: 999, proposalsPerMonthLimit: 999 },
    ];

    it("plano enterprise deve ter limites maiores que starter", () => {
      const starter = plans.find((p) => p.slug === "starter")!;
      const enterprise = plans.find((p) => p.slug === "enterprise")!;
      expect(enterprise.usersLimit).toBeGreaterThan(starter.usersLimit);
      expect(enterprise.requestsPerMonthLimit).toBeGreaterThan(starter.requestsPerMonthLimit);
    });
  });
});

// ─────────────────────────────────────────────
// 5. STATUS DE REQUEST
// ─────────────────────────────────────────────

describe("Request — Ciclo de vida de status", () => {
  const VALID_REQUEST_STATUSES = ["open", "receiving", "selected", "closed"];

  it("request nasce com status 'open'", () => {
    const request = makeRequest();
    expect(request.status).toBe("open");
  });

  it("todos os status válidos devem estar presentes", () => {
    expect(VALID_REQUEST_STATUSES).toContain("open");
    expect(VALID_REQUEST_STATUSES).toContain("receiving");
    expect(VALID_REQUEST_STATUSES).toContain("selected");
    expect(VALID_REQUEST_STATUSES).toContain("closed");
  });
});

// ─────────────────────────────────────────────
// 6. AUTORIZAÇÃO POR ROLE
// ─────────────────────────────────────────────

describe("Autorização — Roles de usuário", () => {
  const VALID_ROLES = ["owner", "manager", "employee", "admin"];

  const canManageUsers = (role: string) => ["owner", "manager"].includes(role);
  const isAdmin = (role: string) => role === "admin";
  const canAccessAdminPanel = (role: string) => isAdmin(role);

  it("owner pode gerenciar usuários", () => {
    expect(canManageUsers("owner")).toBe(true);
  });

  it("manager pode gerenciar usuários", () => {
    expect(canManageUsers("manager")).toBe(true);
  });

  it("employee não pode gerenciar usuários", () => {
    expect(canManageUsers("employee")).toBe(false);
  });

  it("apenas admin acessa painel administrativo", () => {
    VALID_ROLES.forEach((role) => {
      if (role === "admin") {
        expect(canAccessAdminPanel(role)).toBe(true);
      } else {
        expect(canAccessAdminPanel(role)).toBe(false);
      }
    });
  });
});
