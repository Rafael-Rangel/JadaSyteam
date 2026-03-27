/**
 * JADA — Global Test Setup
 * Arquivo: tests/setup.ts
 *
 * Executado antes de todos os testes Jest.
 * Configura mocks globais, variáveis de ambiente e teardown.
 */

import { jest } from "@jest/globals";

// ─── Variáveis de ambiente para testes ───────────────────────────────────────

process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/jada_test";
process.env.NEXTAUTH_SECRET = "test-secret-jada-32-characters!!";
process.env.NEXTAUTH_URL = "http://localhost:3000";
process.env.ASAAS_ENV = "sandbox";
process.env.ASAAS_API_KEY = "test-asaas-key";
process.env.ASAAS_WEBHOOK_TOKEN = "test-webhook-token";
process.env.RESEND_API_KEY = "re_test_key";
process.env.RESEND_FROM_EMAIL = "noreply@test.jada.com.br";

// ─── Mock global do Prisma ────────────────────────────────────────────────────
// Evita conexões reais com banco em testes unitários de lógica

jest.mock("@/lib/prisma", () => ({
  __esModule: true,
  default: {
    company: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    plan: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    request: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    proposal: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    billingEvent: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    passwordResetToken: {
      findUnique: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
    $transaction: jest.fn((fn: any) => fn({
      company: { update: jest.fn() },
      billingEvent: { create: jest.fn() },
    })),
    $disconnect: jest.fn(),
  },
}));

// ─── Mock do cliente Asaas ───────────────────────────────────────────────────

jest.mock("@/lib/asaas", () => ({
  __esModule: true,
  asaasClient: {
    post: jest.fn(),
    get: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

// ─── Mock da BrasilAPI ───────────────────────────────────────────────────────

jest.mock("@/lib/cnpjVerification", () => ({
  __esModule: true,
  verifyCNPJ: jest.fn().mockResolvedValue({
    status: "OK",
    situacao_cadastral: "ATIVA",
    razao_social: "Empresa Teste LTDA",
  }),
}));

// ─── Mock do Resend (email) ──────────────────────────────────────────────────

jest.mock("resend", () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: {
      send: jest.fn().mockResolvedValue({ id: "email-test-id" }),
    },
  })),
}));

// ─── Limpeza após cada teste ─────────────────────────────────────────────────

afterEach(() => {
  jest.clearAllMocks();
});

afterAll(async () => {
  jest.restoreAllMocks();
});
