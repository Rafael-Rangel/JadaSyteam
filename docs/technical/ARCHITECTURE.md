# Architecture

## 1) High-level view

JADA e uma aplicacao web B2B baseada em Next.js (App Router), com autenticacao via NextAuth (JWT), persistencia em PostgreSQL (Supabase) usando Prisma, e cobranca recorrente via Asaas.

### Blocos principais

- **Frontend App Router**: paginas em `app/**/page.tsx`, layouts por area (`buyer`, `seller`) e middleware de gate inicial.
- **Backend HTTP (Route Handlers)**: APIs em `app/api/**/route.ts`.
- **Camada de dominio/servicos**:
  - `lib/planService.ts`: leitura de planos e fallback.
  - `lib/cnpjVerification.ts`: validacao/consulta CNPJ na BrasilAPI.
  - `lib/asaas.ts`: client HTTP Asaas.
  - `lib/asaasBilling.ts`: orquestracao customer/subscription/payment.
- **Persistencia**:
  - Prisma Client (`lib/prisma.ts`)
  - Schema e migracoes em `prisma/schema.prisma` e `prisma/migrations/*`.
- **Integracoes externas**:
  - BrasilAPI para status cadastral de CNPJ.
  - Asaas para customer, subscription, payments e webhook.

## 2) Arquitetura por camadas

### Presentation layer

- Páginas públicas: landing, auth, planos, institucionais.
- Páginas protegidas por contexto:
  - `/buyer/*`
  - `/seller/*`
  - `/admin/*`
  - `/aguardando-pagamento`
- Componentes compartilhados em `components/*`.

### API layer

- Endpoints de autenticação e cadastro.
- Endpoints de domínio (company/users, requests, proposals).
- Endpoints administrativos (plans/companies/stats/financial).
- Endpoints de billing e webhook.

### Domain/services layer

- Regras críticas:
  - Limites por plano.
  - Elegibilidade por tipo de empresa (`buyer/seller/both`).
  - CNPJ aprovado para operar no marketplace.
  - Aprovação operacional + billing ativo para liberar áreas protegidas.
- Serviço de billing encapsulado (`createBillingForCompany`) para evitar duplicação de lógica nas rotas.

### Data layer

- PostgreSQL modelado com Prisma.
- Entidades centrais: `Company`, `User`, `Plan`, `Request`, `Proposal`, `BillingEvent`.
- Estados relevantes:
  - `verificationStatus`
  - `approvalStatus`
  - `billingStatus`

## 3) Fluxo de request no runtime

1. Cliente acessa rota.
2. `middleware.ts` aplica gate inicial para rotas protegidas.
3. Em áreas buyer/seller, layouts server-side aplicam gate de aprovação/cobrança.
4. Páginas chamam APIs internas (`/api/...`) para dados mutáveis.
5. Route handler valida sessão/autorização e aplica regra de negócio.
6. Persistência via Prisma.
7. Quando necessário, integração externa (Asaas/BrasilAPI).

## 4) Estratégia de billing dentro da arquitetura

- Cadastro grava preferências (`preferredBillingType`, `preferredBillingPeriod`) e não gera cobrança imediata.
- Aprovação no admin é o gatilho para criação de customer + assinatura no Asaas.
- Webhook do Asaas atualiza estado no banco.
- Endpoint de consulta de pagamento (`/api/company/payment-link`) também sincroniza estado de forma defensiva quando identifica pagamento confirmado no Asaas.

## 5) Decisões arquiteturais importantes

- **Single source of truth operacional**: estado de acesso mantido no banco da aplicação (`Company`).
- **Gateway-hosted checkout**: pagamento em ambiente Asaas (reduz escopo PCI da aplicação).
- **Auth stateless (JWT)**: reduz dependência de sessão em banco, com tradeoff de revogação imediata.
- **Enforcement em múltiplas camadas**:
  - middleware (acesso inicial),
  - layouts (gate por billing),
  - APIs (autorização e regra de negócio).

## 6) Trade-offs atuais

- Middleware não cobre `/api/*` (proteção feita endpoint a endpoint).
- Sessão JWT com duração longa (performance/escala) versus revogação imediata de privilégios.
- Parte do controle de fluxo está na UI/layout e parte nas APIs; exige disciplina para manter coerência.
