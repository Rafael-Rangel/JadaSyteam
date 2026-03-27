# Database Model (Prisma + PostgreSQL)

## 1) Base stack

- Banco: PostgreSQL (Supabase).
- ORM: Prisma.
- Migração: `prisma migrate`.
- Arquivo fonte: `prisma/schema.prisma`.

## 2) Entidades centrais

## User

- Identidade e credenciais do usuário da plataforma.
- Campos relevantes:
  - `email` (unique)
  - `password` (hash bcrypt)
  - `role` (owner/manager/employee/admin)
  - `companyId` (FK)

## Company

Entidade de tenant e principal agregado do domínio.

Campos de negócio:
- `type`: buyer/seller/both
- `plan`: slug do plano
- `verificationStatus`: pending/approved/rejected
- `approvalStatus`: pending/approved/rejected

Campos de billing:
- `billingProvider`
- `billingStatus` (pending/active/past_due/canceled etc.)
- `billingCycle`
- `billingCustomerId`
- `billingSubscriptionId`
- `billingNextDueDate`
- `billingLastEventAt`
- `billingLastPayload`
- `billingManuallyApproved`
- `preferredBillingType`
- `preferredBillingPeriod`

## Plan

Catálogo comercial da plataforma.

- `slug` (unique)
- `price`
- limites de uso:
  - `usersLimit`
  - `requestsPerMonthLimit`
  - `proposalsPerMonthLimit`

## Request

Demanda de compra criada por empresa compradora.

- `buyerId` -> `Company`
- `status`: open/receiving/selected/closed
- `isPublic`

## Proposal

Oferta de empresa vendedora para uma `Request`.

- `requestId` -> `Request`
- `sellerId` -> `Company`
- `status`: sent/viewed/accepted/rejected

## BillingEvent

Auditoria de eventos de cobrança recebidos via webhook.

- `companyId` -> `Company`
- `provider`
- `eventType`
- `externalId`
- `payload` (json)

## PasswordResetToken

- recuperação de senha com expiração.

## 3) Relacionamentos

- `Company 1:N User`
- `Company 1:N Request` (como buyer)
- `Company 1:N Proposal` (como seller)
- `Request 1:N Proposal`
- `Company 1:N BillingEvent`
- `User 1:N PasswordResetToken`

## 4) Regras de consistência aplicadas no código

- Email de usuário é normalizado para lowercase no cadastro.
- CNPJ é normalizado para dígitos.
- Aprovação e cobrança:
  - empresa aprovada pode disparar criação de assinatura Asaas;
  - acesso operacional requer billing ativo (ou liberação manual).
- Limites por plano são verificados em runtime antes de criar usuário/request/proposal.

## 5) Índices e performance

- `BillingEvent` possui índice composto em `(companyId, receivedAt)`.
- `email` em `User` e `slug` em `Plan` são únicos.
- Para escala maior, recomenda-se índices adicionais:
  - `Company(approvalStatus, billingStatus)`
  - `Request(buyerId, createdAt)`
  - `Proposal(sellerId, createdAt)`

## 6) Migrações de billing relevantes

- `20260318002129_add_billing_asaas`
- `20260327000000_add_billing_manually_approved`
- `20260327120000_add_company_approval_and_billing_preferences`

## 7) Riscos de modelagem observados

- `role` e `type` como `String` (sem enum Prisma) exigem validação rigorosa na aplicação.
- `Company.plan` é string (slug), sem FK formal para `Plan.slug`.
- Campos JSON de payload podem crescer sem política de retenção.
