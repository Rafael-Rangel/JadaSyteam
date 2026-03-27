/**
 * JADA — Auth Setup para Playwright
 * Arquivo: tests/e2e/auth.setup.ts
 *
 * Gera sessões autenticadas (buyer, seller, admin) salvas em disco.
 * Reutilizadas pelos testes E2E — evita login repetido em cada teste.
 *
 * Como usar:
 *   1. Configure as variáveis abaixo com contas de teste reais no seu ambiente
 *   2. npx playwright test --project=setup
 *   3. As sessões ficam em playwright/.auth/*.json
 */

import { test as setup, expect } from "@playwright/test";
import path from "path";

// ─── Contas de teste (configure no .env ou aqui diretamente para staging) ───

const BUYER_EMAIL = process.env.TEST_BUYER_EMAIL ?? "buyer-e2e@jada.com.br";
const BUYER_PASSWORD = process.env.TEST_BUYER_PASSWORD ?? "Senha@TestBuyer1";

const SELLER_EMAIL = process.env.TEST_SELLER_EMAIL ?? "seller-e2e@jada.com.br";
const SELLER_PASSWORD = process.env.TEST_SELLER_PASSWORD ?? "Senha@TestSeller1";

const ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL ?? "admin-e2e@jada.com.br";
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD ?? "Senha@TestAdmin1";

// ─── Paths de saída ───

const buyerFile = path.join(__dirname, "../../playwright/.auth/buyer.json");
const sellerFile = path.join(__dirname, "../../playwright/.auth/seller.json");
const adminFile = path.join(__dirname, "../../playwright/.auth/admin.json");

// ─────────────────────────────────────────────
// Setup: Buyer
// ─────────────────────────────────────────────

setup("autenticar buyer", async ({ page }) => {
  await page.goto("/login");
  await page.getByPlaceholder("seu@email.com").fill(BUYER_EMAIL);
  await page.getByPlaceholder("••••••••").fill(BUYER_PASSWORD);
  await page.getByRole("button", { name: /entrar|login/i }).click();

  // Aguarda redirecionamento pós-login (buyer ativo vai para /buyer/dashboard)
  await page.waitForURL(/buyer\/dashboard|aguardando-pagamento/, { timeout: 10000 });

  await page.context().storageState({ path: buyerFile });
  console.log("✅ Sessão buyer salva em", buyerFile);
});

// ─────────────────────────────────────────────
// Setup: Seller
// ─────────────────────────────────────────────

setup("autenticar seller", async ({ page }) => {
  await page.goto("/login");
  await page.getByPlaceholder("seu@email.com").fill(SELLER_EMAIL);
  await page.getByPlaceholder("••••••••").fill(SELLER_PASSWORD);
  await page.getByRole("button", { name: /entrar|login/i }).click();

  await page.waitForURL(/seller\/dashboard|aguardando-pagamento/, { timeout: 10000 });

  await page.context().storageState({ path: sellerFile });
  console.log("✅ Sessão seller salva em", sellerFile);
});

// ─────────────────────────────────────────────
// Setup: Admin
// ─────────────────────────────────────────────

setup("autenticar admin", async ({ page }) => {
  await page.goto("/login");
  await page.getByPlaceholder("seu@email.com").fill(ADMIN_EMAIL);
  await page.getByPlaceholder("••••••••").fill(ADMIN_PASSWORD);
  await page.getByRole("button", { name: /entrar|login/i }).click();

  await page.waitForURL(/admin\/dashboard/, { timeout: 10000 });

  await page.context().storageState({ path: adminFile });
  console.log("✅ Sessão admin salva em", adminFile);
});
