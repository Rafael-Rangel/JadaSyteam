# 🧪 JADA — Suíte Completa de Testes

Documentação técnica da estratégia de testes do projeto JADA.  
Gerado com base na documentação técnica: `ARCHITECTURE.md`, `BUSINESS_LOGIC.md`, `DATABASE_MODEL.md`, `ROUTES_AND_APIS.md`, `SECURITY_AND_INFRA.md`.

---

## 📁 Estrutura

```
tests/
├── business/
│   ├── onboarding.test.ts          # Cadastro, CNPJ, billing state machine, gates
│   └── requests-proposals.test.ts  # Requests, proposals, limites de plano, roles
├── security/
│   └── pentest.test.ts             # 8 categorias de ataques automatizados
├── e2e/
│   ├── flows.spec.ts               # 8 fluxos E2E com Playwright
│   ├── auth.setup.ts               # Geração de sessões autenticadas
│   └── playwright.config.ts        # Configuração Playwright
├── jest.config.ts                  # Configuração Jest + cobertura
└── setup.ts                        # Mocks globais (Prisma, Asaas, BrasilAPI, Resend)
```

---

## 🚀 Instalação

```bash
# Dependências de teste
npm install -D jest ts-jest @types/jest
npm install -D @playwright/test

# Instalar browsers para E2E
npx playwright install chromium
```

---

## ▶️ Rodando os Testes

### Testes de Regra de Negócio (Jest)

```bash
# Todos os testes unitários/integração
npx jest

# Com relatório de cobertura
npx jest --coverage

# Apenas onboarding
npx jest tests/business/onboarding

# Apenas requests/proposals
npx jest tests/business/requests-proposals
```

### Testes de Segurança (Pentest)

```bash
# ⚠️  SOMENTE em ambiente de dev/staging!
TEST_BASE_URL=http://localhost:3000 \
TEST_BUYER_TOKEN=seu_jwt_buyer \
TEST_SELLER_TOKEN=seu_jwt_seller \
TEST_ADMIN_TOKEN=seu_jwt_admin \
ASAAS_WEBHOOK_TOKEN=seu_token_webhook \
npx jest tests/security/pentest
```

### Testes E2E (Playwright)

```bash
# 1. Configurar variáveis de ambiente
export PLAYWRIGHT_BASE_URL=http://localhost:3000
export TEST_BUYER_EMAIL=buyer-e2e@jada.com.br
export TEST_BUYER_PASSWORD=Senha@TestBuyer1
export TEST_SELLER_EMAIL=seller-e2e@jada.com.br
export TEST_SELLER_PASSWORD=Senha@TestSeller1
export TEST_ADMIN_EMAIL=admin-e2e@jada.com.br
export TEST_ADMIN_PASSWORD=Senha@TestAdmin1

# 2. Gerar sessões autenticadas
npx playwright test --project=setup

# 3. Rodar todos os E2E
npx playwright test

# 4. Ver relatório HTML
npx playwright show-report
```

---

## 📊 Cobertura Mínima Esperada

| Camada             | Meta  | Arquivo de referência       |
|--------------------|-------|-----------------------------|
| Linhas             | ≥ 75% | `lib/**`, `app/api/**`      |
| Branches           | ≥ 70% | gates, status, role checks  |
| Funções            | ≥ 75% | services, handlers          |
| Statements         | ≥ 75% | geral                       |

---

## 🔒 Vulnerabilidades Identificadas (Pentest)

Com base nos documentos `SECURITY_AND_INFRA.md` e análise das rotas:

### 🔴 Alta Prioridade

| ID       | Categoria             | Descrição                                                                    | Status    |
|----------|-----------------------|------------------------------------------------------------------------------|-----------|
| SEC-01-A | Broken Auth           | JWT de longa duração mantém privilégios antigos após rebaixamento de role    | ⚠️ Gap    |
| SEC-02-A | IDOR                  | Sem validação de tenant isolado em todos os endpoints (a confirmar por rota) | ⚠️ Testar |
| SEC-05-A | Mass Assignment       | PATCH `/api/company` pode aceitar campos protegidos (approvalStatus)         | ⚠️ Testar |

### 🟡 Média Prioridade

| ID       | Categoria             | Descrição                                                                    | Status    |
|----------|-----------------------|------------------------------------------------------------------------------|-----------|
| SEC-08-A | Rate Limiting         | Sem rate limiting em `/api/auth/*` e `/api/auth/signup`                      | ⚠️ Gap    |
| SEC-08-B | Rate Limiting         | Sem rate limiting em `/api/webhooks/asaas`                                   | ⚠️ Gap    |
| SEC-04-A | Webhook               | Sem deduplicação formal por event ID (idempotência incompleta)               | ⚠️ Gap    |
| SEC-07-A | Data Exposure         | Headers HTTP de segurança não centralizados (`next.config.js`)               | ⚠️ Gap    |

### 🟢 Baixa Prioridade / Hardening

| ID       | Categoria             | Descrição                                                                    | Status    |
|----------|-----------------------|------------------------------------------------------------------------------|-----------|
| SEC-03-A | Input Validation      | Campos `role` e `type` são strings sem enum — dependem de validação manual   | ⚠️ Gap    |
| SEC-03-B | Input Validation      | Sem schema validator central (Zod) em todos os handlers                      | ⚠️ Gap    |
| SEC-07-B | Data Exposure         | Payloads JSON de billing podem crescer sem política de retenção              | ⚠️ Info   |

---

## 🛠️ Correções Recomendadas

### 1. Rate Limiting — `app/api/auth/signup/route.ts` e `app/api/auth/forgot-password/route.ts`

```typescript
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "1 m"), // 5 req/min por IP
});

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
  const { success } = await ratelimit.limit(ip);
  if (!success) {
    return Response.json({ error: "Too many requests" }, { status: 429 });
  }
  // ... resto do handler
}
```

### 2. Security Headers — `next.config.js`

```javascript
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-XSS-Protection", value: "1; mode=block" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Content-Security-Policy",
    value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; ...",
  },
];

module.exports = {
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};
```

### 3. Idempotência de Webhook — `app/api/webhooks/asaas/route.ts`

```typescript
// Antes de processar, verificar se evento já foi processado
const existing = await prisma.billingEvent.findFirst({
  where: { externalId: event.payment?.id, eventType: event.event },
});
if (existing) {
  return Response.json({ ok: true, deduplicated: true });
}
// ... processar evento
```

### 4. Validação com Zod em todos os handlers

```typescript
import { z } from "zod";

const CreateRequestSchema = z.object({
  title: z.string().min(5).max(200),
  description: z.string().min(10).max(2000),
  isPublic: z.boolean().default(true),
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = CreateRequestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues }, { status: 422 });
  }
  // ... usar parsed.data (tipado e seguro)
}
```

### 5. Proteção contra Mass Assignment — PATCH de Company

```typescript
// Whitelist explícita de campos editáveis pelo usuário
const ALLOWED_COMPANY_PATCH_FIELDS = ["name", "phone", "address", "description"] as const;

const sanitized = Object.fromEntries(
  Object.entries(body).filter(([key]) => ALLOWED_COMPANY_PATCH_FIELDS.includes(key as any))
);
```

---

## 📋 Checklist de CI/CD

Adicione ao seu pipeline (GitHub Actions, etc.):

```yaml
- name: Run Unit & Business Logic Tests
  run: npx jest --coverage --ci

- name: Check Coverage Thresholds
  run: npx jest --coverage --coverageThreshold='{"global":{"lines":75}}'

- name: Run Security Tests
  run: npx jest tests/security --ci
  env:
    TEST_BASE_URL: ${{ secrets.STAGING_URL }}
    TEST_BUYER_TOKEN: ${{ secrets.TEST_BUYER_TOKEN }}
    TEST_ADMIN_TOKEN: ${{ secrets.TEST_ADMIN_TOKEN }}
    ASAAS_WEBHOOK_TOKEN: ${{ secrets.ASAAS_WEBHOOK_TOKEN }}

- name: Run E2E Tests
  run: npx playwright test
  env:
    PLAYWRIGHT_BASE_URL: ${{ secrets.STAGING_URL }}
```

---

## 🧩 Contas de Teste Necessárias

Crie no banco de staging antes de rodar os E2E:

| Conta               | Role  | Tipo   | Estado                          |
|---------------------|-------|--------|---------------------------------|
| buyer-e2e@jada.com.br   | owner | buyer  | approved + billingStatus=active |
| seller-e2e@jada.com.br  | owner | seller | approved + billingStatus=active |
| admin-e2e@jada.com.br   | admin | —      | role=admin                      |
| pending-buyer@test.com  | owner | buyer  | approvalStatus=pending          |
| pending-seller@test.com | owner | seller | approvalStatus=pending          |

Script de seed (adapte ao seu seed do Prisma):

```bash
npx ts-node prisma/seed-test-accounts.ts
```
