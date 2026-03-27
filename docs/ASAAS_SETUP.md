# Asaas (Sandbox → Produção) – Setup, Webhook e Fluxo na JADA

Este guia explica como configurar o Asaas no projeto JADA para testes (Sandbox) e depois colocar em produção, mantendo a manutenção simples.

## 0) Segurança (importante)

- **Não commite** chaves do Asaas.
- Como você colou uma API key aqui, recomendo **rotacionar a chave** no Asaas e gerar outra.

## 1) Variáveis de ambiente

Copie `.env.example` para `.env` e configure:

- `ASAAS_ENV`: `sandbox` ou `production`
- `ASAAS_API_KEY`: chave do Asaas (sandbox ou produção)
- `ASAAS_WALLET_ID`: opcional (split)
- `ASAAS_WEBHOOK_TOKEN`: token que você define no painel de webhook

No código, a base URL muda automaticamente:

- Sandbox: `https://api-sandbox.asaas.com/v3`
- Produção: `https://api.asaas.com/v3`

## 2) Migração do banco (billing)

Foi adicionado suporte a billing no Prisma:

- Campos na tabela `Company` (provider, status, ciclo, ids externos, nextDueDate)
- Tabela `BillingEvent` para auditoria de webhooks

Migração criada em:

- `prisma/migrations/20260318002129_add_billing_asaas/migration.sql`

Quando seu `DIRECT_URL` (porta 5432) estiver acessível, aplique com:

```bash
npx prisma migrate deploy
```

## 3) Endpoints criados

### 3.1 Criar assinatura/cobrança (MVP)

- **POST** `app/api/billing/asaas/subscribe/route.ts` (fluxo manual, opcional)

Body:

```json
{ "period": "monthly|semiannually|yearly", "billingType": "PIX|BOLETO" }
```

O endpoint:

1. Cria `customer` no Asaas (se a empresa ainda não tiver `billingCustomerId`)
2. Cria `subscription` no Asaas com ciclo:
   - `monthly` → `MONTHLY`
   - `semiannually` → `SEMIANNUALLY`
   - `yearly` → `YEARLY`
3. Salva na `Company`:
   - `billingProvider = 'asaas'`
   - `billingStatus = 'pending'`
   - `billingSubscriptionId`
   - `billingNextDueDate`
4. Busca o 1º pagamento da assinatura e retorna `invoiceUrl`/`bankSlipUrl` (quando disponível)

No fluxo principal atual de onboarding, a cobrança é criada pela aprovação administrativa (`PATCH /api/admin/companies/:id` com `approvalStatus=approved`), usando as preferências salvas no cadastro:

- `Company.preferredBillingType`
- `Company.preferredBillingPeriod`

### 3.2 Webhook Asaas

- **POST** `app/api/webhooks/asaas/route.ts`

Validação:

- O Asaas envia o token configurado no painel no header **`asaas-access-token`**.
- A rota compara com `ASAAS_WEBHOOK_TOKEN`.

Eventos que a JADA usa (MVP):

- `PAYMENT_CONFIRMED` / `PAYMENT_RECEIVED` / `CHECKOUT_PAID` → `billingStatus = active`
- `PAYMENT_OVERDUE` → `billingStatus = past_due`
- `SUBSCRIPTION_INACTIVATED` / `SUBSCRIPTION_DELETED` → `billingStatus = canceled`

Além disso, quando encontra a empresa, a rota registra o evento em `BillingEvent` (auditoria).

## 4) Configurar webhook no painel Asaas (Sandbox)

No painel do Asaas (Sandbox): **Integrações → Webhooks → Adicionar webhook**.

Use exatamente estes dados (o token já está no seu `.env`):

| Campo | Valor |
|-------|--------|
| **URL** | `https://SEU_DOMINIO/api/webhooks/asaas` (em dev local use um túnel: ngrok, Cloudflare Tunnel, etc.) |
| **Token de autenticação** | `jada_webhook_sandbox_8f3a2b1c9e4d` (o mesmo que `ASAAS_WEBHOOK_TOKEN` no `.env`) |

- **URL em desenvolvimento**: use **Cloudflare Tunnel** (sem senha no navegador, webhooks funcionam). Na pasta do projeto: `./cloudflared tunnel --url http://localhost:3000` (o binário `cloudflared` fica na raiz do repo após o primeiro download). Use a URL exibida + `/api/webhooks/asaas`. Alternativa: ngrok (`ngrok http 3000`). Evite localtunnel para webhooks (página de senha pode bloquear o Asaas).
- **URL em produção**: `https://seudominio.com/api/webhooks/asaas`.

**Eventos a marcar no formulário do webhook**:
  - Cobranças:
    - `PAYMENT_CREATED`
    - `PAYMENT_CONFIRMED`
    - `PAYMENT_RECEIVED`
    - `PAYMENT_OVERDUE`
    - `PAYMENT_REFUNDED` (opcional)
    - `PAYMENT_DELETED` (opcional)
  - Assinaturas:
    - `SUBSCRIPTION_CREATED`
    - `SUBSCRIPTION_UPDATED`
    - `SUBSCRIPTION_INACTIVATED`
    - `SUBSCRIPTION_DELETED`

Notas:

- **PIX** normalmente vai direto para `PAYMENT_RECEIVED` (pode pular `PAYMENT_CONFIRMED`).  
  Referência: eventos de pagamentos do Asaas.
- **Boleto** costuma seguir `PAYMENT_CREATED` → `PAYMENT_CONFIRMED` → `PAYMENT_RECEIVED`.

## 5) Onde testar na UI

- Tela de espera/pagamento: `/aguardando-pagamento`
- Comprador: `/buyer/subscription` (fluxo manual opcional)
- Vendedor: `/seller/subscription` (fluxo manual opcional)

Na tela de assinatura existe um bloco “Cobrança via Asaas” com:

- seletor de **período** (mensal / 6 meses / anual)
- seletor de **método** (PIX / boleto)
- botão **Gerar cobrança**
- link retornado (`invoiceUrl`/`bankSlipUrl`)

## 6) Ir para produção (quando terminar o Sandbox)

Checklist:

1. Trocar `ASAAS_ENV` para `production`
2. Trocar `ASAAS_API_KEY` para a chave de produção
3. Configurar `ASAAS_WEBHOOK_TOKEN` (novo token)
4. Criar o webhook no painel de produção com a URL de produção
5. Aplicar migrações em produção (`npx prisma migrate deploy`)

## 7) Cartão de crédito e segurança (PCI)

- **Cartão está disponível:** na criação da assinatura (cadastro ou área financeira) pode-se escolher **Cartão de crédito**. A API Asaas aceita assinatura com `billingType: CREDIT_CARD` **sem** enviar dados do cartão; o Asaas gera a cobrança e devolve o **invoiceUrl**. O usuário abre esse link e informa o cartão na **página do Asaas** (dados sensíveis não passam pelo nosso servidor = PCI-safe).
- Nenhum número de cartão é armazenado ou trafegado pelo backend ou banco da JADA.

## 8) Aprovação manual e acesso à plataforma

- Cadastro cria conta sem cobrança imediata, com `approvalStatus = pending` e preferências de cobrança (`preferredBillingType`, `preferredBillingPeriod`).
- Ao aprovar no admin (`approvalStatus = approved`), o backend gera customer + assinatura + cobrança no Asaas.
- O acesso às áreas Comprador e Vendedor só é liberado quando `billingStatus = active` (webhook) ou `billingManuallyApproved = true`.
- Enquanto não liberar, o usuário autenticado é redirecionado para `/aguardando-pagamento`.
- _(Texto anterior sobre PIX/Boleto/Cartão:)_ **PIX e Boleto:** o Asaas gera um link (`invoiceUrl` / `bankSlipUrl`). O usuário abre, paga e pronto. Nenhum dado sensível passa pelo seu servidor.
- **Cartão de crédito:** para assinatura com cartão, a API Asaas exige **dados do cartão** ou um **token** gerado pela tokenização. Isso implica:
  - **Segurança (PCI):** não é permitido digitar número de cartão no seu site e enviar ao seu backend. O fluxo correto é: formulário/iframe do Asaas no front (ou checkout hospedado do Asaas) → token → seu backend envia só o token ao Asaas.
  - **Implementação:** é preciso integrar a tokenização (JS/iframe do Asaas) ou redirecionar para uma página de pagamento hospedada pelo Asaas. Por isso cartão ficou como melhoria futura (veja “Próximas melhorias” abaixo).

## 9) Próximas melhorias (pós-MVP)

- Armazenar o **ID do payment** atual e exibir histórico de cobranças.
- Permitir cancelamento/upgrade/downgrade com regra de negócio (pro rata).
- Implementar split usando `ASAAS_WALLET_ID` quando necessário.

