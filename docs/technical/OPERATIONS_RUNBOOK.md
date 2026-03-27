# Operations Runbook

## 1) Ambientes e variáveis

Variáveis obrigatórias:

- Banco:
  - `DATABASE_URL` (pool/app)
  - `DIRECT_URL` (migrações)
- Auth:
  - `NEXTAUTH_SECRET`
  - `NEXTAUTH_URL`
- Email:
  - `RESEND_API_KEY`
  - `RESEND_FROM_EMAIL`
- Billing:
  - `ASAAS_ENV`
  - `ASAAS_API_KEY`
  - `ASAAS_WEBHOOK_TOKEN`
  - `ASAAS_WALLET_ID` (opcional)

Referência base: `.env.example`.

## 2) Startup local

1. `npm install`
2. configurar `.env`
3. `npx prisma migrate deploy`
4. `npx prisma generate`
5. `npm run dev`

## 3) Deploy checklist

Pré-deploy:

- validar variáveis no ambiente alvo;
- revisar migrações pendentes;
- smoke test de login e admin.

Deploy:

1. aplicar migrações;
2. subir build/app;
3. validar endpoints críticos.

Pós-deploy:

- testar cadastro -> aprovação -> cobrança -> pagamento;
- confirmar webhook recebendo eventos;
- verificar liberação automática de acesso.

## 4) Operação de billing (Asaas)

## Aprovação de empresa

- ação em `/admin/companies` dispara geração de cobrança quando necessário.
- em erro 400, usar mensagem retornada pelo backend para correção de dados (ex.: telefone inválido).

## Webhook

- endpoint: `/api/webhooks/asaas`
- autenticação por token no header `asaas-access-token`
- monitorar:
  - taxa de 403 (token divergente)
  - taxa de 500
  - atraso entre pagamento e atualização de `billingStatus`

## Fallback de status

- endpoint `/api/company/payment-link` sincroniza status para `active` quando identifica pagamento confirmado no Asaas mesmo sem webhook concluído.

## 5) Troubleshooting

## Erro Prisma "Unknown field ..."

Causa comum:
- código atualizado com novos campos, mas migração não aplicada no banco.

Ações:
1. `npx prisma migrate status`
2. resolver migração travada (`prisma migrate resolve`) quando necessário
3. `npx prisma migrate deploy`
4. restart da aplicação

## Aprovação admin retorna 400

Verificar:
- mensagem da API (agora exposta na UI admin);
- dados de CNPJ/telefone;
- integridade de plano escolhido;
- credenciais Asaas e ambiente (`sandbox`/`production`).

## Pagou mas continua "pending"

Verificar:
- webhook Asaas configurado e token correto;
- eventos no `BillingEvent`;
- endpoint `/api/company/payment-link` refletindo pagamento confirmado.

## 6) Observabilidade recomendada

- Logs estruturados por endpoint com:
  - request id
  - company id
  - actor role
  - provider response code (Asaas/BrasilAPI)
- Métricas:
  - sucesso/erro por endpoint
  - latência p95
  - funil de onboarding (signup -> approved -> paid -> active)
- Alertas:
  - webhook 5xx acima de limiar
  - queda abrupta de conversão para `billingStatus=active`
