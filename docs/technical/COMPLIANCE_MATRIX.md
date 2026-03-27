# Matriz de Conformidade — Auditoria Funcional e Segurança

## Status consolidado

- Billing gate em APIs de negócio (`/api/requests`, `/api/proposals/create`, `/api/proposals/accept`): **Implementado**
- Hardening de mass assignment em `PATCH /api/company`: **Implementado**
- Role escalation em criação de usuários da empresa: **Implementado (mantido)**
- Idempotência de criação de assinatura Asaas: **Implementado (reuso + lock in-flight)**
- Deduplicação de webhook Asaas: **Implementado**
- Rate limiting em rotas críticas de autenticação pública: **Implementado**
- Mudança de plano pelo usuário: **Implementado**
- Cancelamento de assinatura pelo usuário: **Implementado**
- Mudança de método de pagamento pós-cadastro: **Implementado**
- Soft delete de usuário: **Implementado (API + autenticação)**
- Migração e execução de E2E (`auth.setup` + `flows.spec`): **Implementado e validado**
- Normalização dos testes herdados (`functional`/`security`) para evitar falso negativo: **Implementado**

## Evidência de regressão final

- `npm run test:business`: **57/57**
- `npm run test:security`: **33/33**
- `npm run test:functional`: **41/41**
- `npm run test:e2e`: **17/17**

## Itens com risco residual

- Invalidação imediata de sessão JWT após soft delete depende do ciclo de renovação do token e da próxima validação de sessão.
- Rate limiting atual é in-memory (single-instance). Para produção distribuída, migrar para Redis.
- A suíte funcional ainda possui testes “soft assertion” que apenas registram warnings em console e dependem de tokens/fixtures adicionais para cobertura total de cenários reais.
