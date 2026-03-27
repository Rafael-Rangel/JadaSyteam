# Routes and APIs Catalog

Este documento lista as rotas existentes no projeto, separando UI e APIs, com foco em autorização e propósito.

## 1) Middleware scope

Arquivo: `middleware.ts`

- Matcher:
  - `/buyer/:path*`
  - `/seller/:path*`
  - `/admin/:path*`
  - `/aguardando-pagamento`
- Regras:
  - sem token JWT: redireciona para `/login`;
  - para `/admin/*`: exige `role === admin`.

## 2) UI routes (App Router)

### Públicas

- `/`
- `/login`
- `/signup`
- `/forgot-password`
- `/reset-password`
- `/plans`
- `/about`
- `/contact`
- `/faq`
- `/privacy`
- `/terms`

### Protegidas (buyer)

- `/buyer/dashboard`
- `/buyer/profile`
- `/buyer/users`
- `/buyer/requests`
- `/buyer/requests/[id]`
- `/buyer/create-request`
- `/buyer/subscription`

### Protegidas (seller)

- `/seller/dashboard`
- `/seller/profile`
- `/seller/users`
- `/seller/opportunities`
- `/seller/opportunities/[id]`
- `/seller/proposals`
- `/seller/settings`
- `/seller/subscription`

### Protegidas (admin)

- `/admin/dashboard`
- `/admin/companies`
- `/admin/plans`
- `/admin/financial`
- `/admin/profile`

### Rota de espera operacional

- `/aguardando-pagamento`

## 3) API routes por domínio

## Auth e conta

| Method | Path | Auth | Objetivo |
|---|---|---|---|
| GET/POST | `/api/auth/[...nextauth]` | NextAuth | Sessão, callback, signin/signout |
| POST | `/api/auth/signup` | Público | Cadastro padrão |
| POST | `/api/auth/signup-with-billing` | Público | Cadastro com preferência de billing |
| POST | `/api/auth/forgot-password` | Público | Solicita recuperação de senha |
| POST | `/api/auth/reset-password` | Público | Redefine senha |

## Planos

| Method | Path | Auth | Objetivo |
|---|---|---|---|
| GET | `/api/plans` | Público | Lista planos ativos |

## Company (tenant)

| Method | Path | Auth | Objetivo |
|---|---|---|---|
| GET/PATCH | `/api/company` | Sessão + companyId | Leitura/atualização de empresa |
| GET/POST | `/api/company/users` | Sessão + companyId | Lista/cria usuários da empresa |
| GET | `/api/company/subscription` | Sessão + companyId | Snapshot de assinatura/limites |
| GET | `/api/company/payment-link` | Sessão + companyId | Link/status de pagamento |

## Requests e proposals

| Method | Path | Auth | Objetivo |
|---|---|---|---|
| GET/POST | `/api/requests` | Sessão + companyId | Listagem e criação de requisições |
| GET/PATCH | `/api/requests/[id]` | Sessão + companyId | Detalhe/atualização de requisição |
| GET | `/api/proposals` | Sessão + companyId | Lista propostas da empresa |
| POST | `/api/proposals/create` | Sessão + companyId | Cria proposta para request |
| POST | `/api/proposals/accept` | Sessão + companyId | Comprador aceita proposta |

## Billing/Asaas

| Method | Path | Auth | Objetivo |
|---|---|---|---|
| POST | `/api/billing/asaas/subscribe` | Sessão + companyId | Cria assinatura/cobrança |
| POST | `/api/webhooks/asaas` | Token webhook | Recebe eventos e sincroniza status |

## Admin APIs

| Method | Path | Auth | Objetivo |
|---|---|---|---|
| GET | `/api/admin/stats` | role=admin | Métricas de dashboard |
| GET | `/api/admin/financial` | role=admin | Visão financeira agregada |
| GET | `/api/admin/companies` | role=admin | Lista empresas com filtros |
| GET/PATCH | `/api/admin/companies/[id]` | role=admin | Detalhe e atualização de empresa |
| POST | `/api/admin/companies/[id]/verify` | role=admin | Revalidação de CNPJ |
| GET/POST | `/api/admin/plans` | role=admin | Listagem/criação de planos |
| GET/PATCH/DELETE | `/api/admin/plans/[id]` | role=admin | Gestão de plano por id |

## 4) Matriz de autorização (resumo)

- **Público**: páginas institucionais, login/signup, `/api/plans`, rotas de recuperação de senha.
- **Usuário logado da empresa**: APIs de `company`, requests/proposals, assinatura e pagamento.
- **Admin**: `/admin/*` e `/api/admin/*`.
- **Webhook machine-to-machine**: `/api/webhooks/asaas` por token dedicado.
