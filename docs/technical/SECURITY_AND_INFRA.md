# Security and Infrastructure

## 1) Infraestrutura atual

- Runtime: Next.js 14 (Node).
- Banco: PostgreSQL via Supabase.
- ORM: Prisma.
- Auth: NextAuth JWT.
- Billing provider: Asaas.
- Verificação cadastral: BrasilAPI.

## 2) Controles de segurança implementados

## Autenticação

- Login com credenciais e senha em hash bcrypt.
- Sessão JWT assinada por `NEXTAUTH_SECRET`.
- Sessão propagada para middleware e APIs via NextAuth.

## Autorização

- Middleware exige login para áreas protegidas.
- Middleware exige `role=admin` para `/admin/*`.
- APIs administrativas validam `role=admin` server-side.
- APIs de tenant exigem `session.user.companyId`.
- Regras por tipo de empresa (`buyer/seller/both`) em endpoints de negócio.

## Segurança de integração Asaas

- Chave de API em variável de ambiente (`ASAAS_API_KEY`).
- Webhook protegido por `asaas-access-token` comparado a `ASAAS_WEBHOOK_TOKEN`.
- Eventos gravados para trilha de auditoria (`BillingEvent`).

## Segurança de dados e segredos

- `.env` ignorado por git.
- `.env.example` orienta uso de chaves separadas por ambiente.
- Fluxo de cartão usa checkout hospedado no Asaas (escopo PCI reduzido).

## 3) Riscos e gaps técnicos

## Alta prioridade

- Sessão JWT longa pode manter privilégios antigos até expirar.
- Nem toda regra de acesso de UI está espelhada em todas as APIs de domínio.
- Criação de assinatura deve continuar idempotente para evitar duplicidade financeira.

## Média prioridade

- Falta de rate limiting explícito em auth e webhook.
- Webhook sem deduplicação formal de eventos (idempotência por event id).
- Payloads JSON de billing podem crescer sem política de retenção.

## Baixa/média prioridade

- Headers de segurança HTTP não centralizados no `next.config.js`.
- Tipos críticos (`role`, `company.type`) são strings no schema; dependem de validação de aplicação.

## 4) Hardening recomendado

## Aplicação

- Adicionar validação de entrada com schema validator central (Zod/Yup) para todos os handlers.
- Adotar enum de domínio para campos críticos (`role`, `type`, status).
- Unificar policy enforcement entre layout e APIs.

## API e edge

- Rate limiting para `/api/auth/*`, cadastro, webhook e endpoints de escrita.
- Controle anti-automação para signup/forgot-password (ex.: captcha/honeypot em cenários públicos).
- Idempotência de webhook usando identificador único do evento.

## Infra/segredos

- Rotação periódica de segredos (`NEXTAUTH_SECRET`, Asaas keys, webhook token).
- Separação forte de ambientes (sandbox/prod) com chaves e webhooks independentes.
- Monitoramento de erro por endpoint e alertas de webhook falhado.

## 5) Segurança operacional de billing

- `approvalStatus` e `billingStatus` devem ser observados como estados independentes:
  - aprovado sem pagamento nao libera uso pleno;
  - pagamento confirmado libera automaticamente.
- Evitar operações manuais em banco sem trilha:
  - quando usar `billingManuallyApproved`, registrar motivo, operador e timestamp.

## 6) Checklist rápido de produção

- `NEXTAUTH_URL` com HTTPS correto.
- `ASAAS_ENV=production` e chave de produção ativa.
- Webhook Asaas configurado para URL pública correta e token alinhado.
- Migrações aplicadas (`prisma migrate deploy`) antes do tráfego.
- Logs centralizados e alerta para 4xx/5xx em endpoints críticos.
