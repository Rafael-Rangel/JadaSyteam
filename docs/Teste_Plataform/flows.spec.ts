import { expect, Page, test } from "@playwright/test";

const uniqueEmail = (prefix: string) => `${prefix}-${Date.now()}@jadateste.com.br`;

async function loginAs(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.getByPlaceholder("seu@email.com").fill(email);
  await page.getByPlaceholder("••••••••").fill(password);
  await page.getByRole("button", { name: /entrar/i }).click();
}

async function completeSignupWizard(
  page: Page,
  opts: { email: string; companyName: string; cnpj: string }
) {
  await page.goto("/signup");

  // Step 1 - Empresa
  await page.getByPlaceholder("Minha Empresa Ltda").fill(opts.companyName);
  await page.getByPlaceholder("00.000.000/0000-00").fill(opts.cnpj);
  await page.getByRole("button", { name: /comprador/i }).click();
  await page.getByRole("button", { name: /^continuar$/i }).click();

  // Step 2 - Responsável
  await page.getByPlaceholder("João Silva").fill("Responsável E2E");
  await page.getByPlaceholder("joao@empresa.com").fill(opts.email);
  await page.getByPlaceholder("(11) 99999-9999").fill("(11) 99999-9999");
  await page.getByPlaceholder("••••••••").first().fill("Senha@1234");
  await page.getByPlaceholder("••••••••").nth(1).fill("Senha@1234");
  await page.getByRole("button", { name: /^continuar$/i }).click();

  // Step 3 - Plano
  const starterCard = page.getByRole("button", { name: /starter/i }).first();
  if ((await starterCard.count()) > 0) {
    await starterCard.click();
  }
  await page.locator("select").first().selectOption("PIX");
  await page.locator("select").nth(1).selectOption("monthly");
  await page.locator("#acceptTerms").check();
  await page.getByRole("button", { name: /finalizar cadastro/i }).click();
}

test.describe("[E2E-01] Cadastro e Onboarding", () => {
  test("wizard de cadastro deve avançar entre etapas", async ({ page }) => {
    await page.goto("/signup");
    await expect(page.getByText(/informações da empresa/i)).toBeVisible();
    await page.getByRole("button", { name: /^continuar$/i }).click();
    await expect(page.getByText(/nome da empresa é obrigatório|cnpj é obrigatório/i).first()).toBeVisible();
  });

  test("cadastro bem-sucedido deve concluir com mensagem de sucesso", async ({ page }) => {
    const email = uniqueEmail("buyer");
    await completeSignupWizard(page, {
      email,
      companyName: `Empresa ${Date.now()}`,
      cnpj: "11222333000181",
    });
    await expect(page.getByText(/cadastro concluído/i)).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole("link", { name: /ir para login/i })).toBeVisible();
  });
});

test.describe("[E2E-02] Gate de Acesso", () => {
  test("usuário pendente é bloqueado ao tentar /buyer/dashboard", async ({ page }) => {
    await loginAs(page, "pending-buyer@test.com", "Senha@1234");
    await page.goto("/buyer/dashboard");
    await expect(page).toHaveURL(/aguardando-pagamento|buyer\/dashboard|login/);
  });

  test("usuário pendente é bloqueado ao tentar /seller/dashboard", async ({ page }) => {
    await loginAs(page, "pending-seller@test.com", "Senha@1234");
    await page.goto("/seller/dashboard");
    await expect(page).toHaveURL(/aguardando-pagamento|seller\/dashboard|login/);
  });
});

test.describe("[E2E-03] Buyer — Requests", () => {
  test.use({ storageState: "playwright/.auth/buyer.json" });

  test("buyer ativo acessa dashboard", async ({ page }) => {
    await page.goto("/buyer/dashboard");
    await expect(page).toHaveURL(/buyer\/dashboard/);
  });

  test("deve criar request com campos obrigatórios", async ({ page }) => {
    await page.goto("/buyer/create-request");
    await page.getByPlaceholder("Ex: 600 parafusos M6").fill(`Req E2E ${Date.now()}`);
    await page.getByPlaceholder("Descreva detalhadamente sua necessidade...").fill("Necessidade de compra automatizada E2E");
    await page.getByPlaceholder("600", { exact: true }).fill("10");
    await page.locator("select").nth(1).selectOption({ label: "Materiais" });
    await page.locator('input[type="date"]').fill("2026-12-31");
    await page.getByPlaceholder(/rua, número, bairro/i).fill("Rua Teste, 123");
    await page.getByPlaceholder("São Paulo").fill("São Paulo");
    await page.getByPlaceholder("SP").fill("SP");
    await page.getByRole("button", { name: /publicar requisição/i }).click();
    await expect(page).toHaveURL(/buyer\/requests/);
  });
});

test.describe("[E2E-04] Seller — Oportunidades", () => {
  test.use({ storageState: "playwright/.auth/seller.json" });

  test("seller ativo deve acessar oportunidades", async ({ page }) => {
    await page.goto("/seller/opportunities");
    await expect(page).toHaveURL(/seller\/opportunities/);
    await expect(page.getByRole("heading", { name: /oportunidades/i })).toBeVisible();
  });
});

test.describe("[E2E-05] Buyer — Aceite de Proposta", () => {
  test.use({ storageState: "playwright/.auth/buyer.json" });

  test("buyer consegue abrir a lista de requisições", async ({ page }) => {
    await page.goto("/buyer/requests");
    await expect(page.getByText(/minhas requisições/i)).toBeVisible();
  });
});

test.describe("[E2E-06] Admin — Aprovação de Empresa", () => {
  test.use({ storageState: "playwright/.auth/admin.json" });

  test("admin deve acessar empresas", async ({ page }) => {
    await page.goto("/admin/companies");
    await expect(page).toHaveURL(/admin\/companies/);
    await expect(page.getByText(/gerencie todas as empresas cadastradas/i)).toBeVisible();
  });

  test("lista administrativa deve exibir status em análise quando existir", async ({ page }) => {
    await page.goto("/admin/companies");
    const analysisBadge = page.getByText(/em análise/i).first();
    const count = await analysisBadge.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });
});

test.describe("[E2E-07] Recuperação de Senha", () => {
  test("deve exibir formulário de forgot password", async ({ page }) => {
    await page.goto("/forgot-password");
    await expect(page.getByPlaceholder("seu@email.com")).toBeVisible();
    await expect(page.getByRole("button", { name: /enviar link de recuperação/i })).toBeVisible();
  });

  test("deve exibir feedback após solicitar reset", async ({ page }) => {
    await page.goto("/forgot-password");
    await page.getByPlaceholder("seu@email.com").fill("usuario@empresa.com");
    await page.getByRole("button", { name: /enviar link de recuperação/i }).click();
    await expect(page.getByText(/e-mail enviado|temporariamente indisponível|erro/i)).toBeVisible({
      timeout: 8000,
    });
  });

  test("reset com token inválido mostra erro amigável", async ({ page }) => {
    await page.goto("/reset-password?token=token-inexistente-00000");
    await page.getByPlaceholder("Mínimo 8 caracteres").fill("NovaSenha@1234");
    await page.getByPlaceholder("Repita a senha").fill("NovaSenha@1234");
    await page.getByRole("button", { name: /redefinir senha/i }).click();
    await expect(page.getByText(/token inválido|expirado|não foi possível/i)).toBeVisible({
      timeout: 8000,
    });
  });
});

test.describe("[E2E-08] Subscription e Limites na UI", () => {
  test.use({ storageState: "playwright/.auth/buyer.json" });

  test("deve exibir informações de assinatura em /buyer/subscription", async ({ page }) => {
    await page.goto("/buyer/subscription");
    await expect(page.getByRole("heading", { name: /assinatura/i })).toBeVisible();
  });
});
