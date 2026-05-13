import { test as setup } from "@playwright/test";
import path from "path";

const BUYER_EMAIL = process.env.TEST_BUYER_EMAIL ?? "buyer-e2e@jada.com.br";
const BUYER_PASSWORD = process.env.TEST_BUYER_PASSWORD ?? "Senha@TestBuyer1";
const SELLER_EMAIL = process.env.TEST_SELLER_EMAIL ?? "seller-e2e@jada.com.br";
const SELLER_PASSWORD = process.env.TEST_SELLER_PASSWORD ?? "Senha@TestSeller1";
const ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL ?? "admin-e2e@jada.com.br";
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD ?? "Senha@TestAdmin1";

const buyerFile = path.join(__dirname, "../../playwright/.auth/buyer.json");
const sellerFile = path.join(__dirname, "../../playwright/.auth/seller.json");
const adminFile = path.join(__dirname, "../../playwright/.auth/admin.json");

setup("autenticar buyer", async ({ page }) => {
  await page.goto("/login");
  await page.getByPlaceholder("seu@email.com").fill(BUYER_EMAIL);
  await page.getByPlaceholder("••••••••").fill(BUYER_PASSWORD);
  await page.getByRole("button", { name: /entrar|login/i }).click();
  await page.waitForURL(/buyer\/dashboard|aguardando-pagamento/, { timeout: 10000 });
  await page.context().storageState({ path: buyerFile });
});

setup("autenticar seller", async ({ page }) => {
  await page.goto("/login");
  await page.getByPlaceholder("seu@email.com").fill(SELLER_EMAIL);
  await page.getByPlaceholder("••••••••").fill(SELLER_PASSWORD);
  await page.getByRole("button", { name: /entrar|login/i }).click();
  await page.waitForURL(/seller\/dashboard|aguardando-pagamento/, { timeout: 10000 });
  await page.context().storageState({ path: sellerFile });
});

setup("autenticar admin", async ({ page }) => {
  await page.goto("/login");
  await page.getByPlaceholder("seu@email.com").fill(ADMIN_EMAIL);
  await page.getByPlaceholder("••••••••").fill(ADMIN_PASSWORD);
  await page.getByRole("button", { name: /entrar|login/i }).click();
  await page.waitForURL(/admin\/dashboard/, { timeout: 10000 });
  await page.context().storageState({ path: adminFile });
});
