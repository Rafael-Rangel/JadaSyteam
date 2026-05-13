import { test, expect } from '@playwright/test';

const BILLING_TYPES = ['PIX', 'BOLETO', 'CREDIT_CARD'] as const;
const RUNS_PER_MODALITY = 3;

/** 14 dígitos (único por contador); APIs externas podem marcar verificação como pending. */
function uniqueCnpj(counter: number): string {
  const part = (Date.now() + counter * 7919) % 10_000_000_000_000;
  return String(part).padStart(14, '0').slice(0, 14);
}

async function completeSignup(
  page: import('@playwright/test').Page,
  opts: { billingType: string; runKey: string; counter: number }
) {
  const { billingType, runKey, counter } = opts;
  const email = `e2e.${billingType.toLowerCase()}.${runKey}@example.invalid`.toLowerCase();

  await page.goto('/signup');
  await expect(page.getByRole('heading', { name: 'Informações da Empresa' })).toBeVisible();

  await page.getByLabel('Nome da Empresa').fill(`E2E ${billingType} ${runKey}`);
  await page.getByLabel('CNPJ').fill(uniqueCnpj(counter));
  await page.getByRole('button', { name: 'Comprador' }).click();
  await page.getByRole('button', { name: 'Continuar' }).first().click();

  await expect(page.getByRole('heading', { name: 'Dados do Responsável' })).toBeVisible();
  await page.getByLabel('Nome Completo').fill('Usuário E2E Cobrança');
  await page.getByLabel('E-mail').fill(email);
  await page.getByLabel('Telefone').fill('11988887777');
  await page.getByLabel('Senha', { exact: true }).fill('SenhaE2E1234!');
  await page.getByLabel('Confirmar Senha').fill('SenhaE2E1234!');
  await page.getByRole('button', { name: 'Continuar' }).click();

  await expect(page.getByRole('heading', { name: 'Escolha seu Plano' })).toBeVisible();
  await expect(page.getByText('Carregando planos')).toBeHidden({ timeout: 30_000 });
  const planBtn = page.getByRole('button', { name: /R\$\s*\d+/ }).first();
  await expect(planBtn).toBeVisible({ timeout: 15_000 });
  await planBtn.click();

  const paymentSelect = page.locator('select').first();
  await paymentSelect.selectOption(billingType);
  await expect(paymentSelect).toHaveValue(billingType);

  await page.locator('#acceptTerms').check();

  await page.getByRole('button', { name: 'Finalizar Cadastro' }).click();

  await expect(page.getByRole('heading', { name: 'Cadastro concluído' })).toBeVisible({
    timeout: 120_000,
  });
  await expect(page.getByText(/Conta criada com sucesso|análise/i)).toBeVisible();
}

test.describe('Cadastro — forma de pagamento (PIX / Boleto / Cartão)', () => {
  test.describe.configure({ mode: 'serial' });

  test('3 cadastros por modalidade (9 fluxos completos)', async ({ page }) => {
    test.setTimeout(900_000);
    const batch = Date.now();

    let run = 0;
    for (const billingType of BILLING_TYPES) {
      for (let i = 1; i <= RUNS_PER_MODALITY; i += 1) {
        run += 1;
        const runKey = `${batch}-${billingType}-${i}`;
        await completeSignup(page, { billingType, runKey, counter: run });
        if (run < BILLING_TYPES.length * RUNS_PER_MODALITY) {
          await page.waitForTimeout(2500);
        }
      }
    }
  });
});
