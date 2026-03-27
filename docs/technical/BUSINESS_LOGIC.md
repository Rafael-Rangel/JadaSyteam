# Business Logic and Workflows

## 1) Onboarding de empresa (fluxo atual)

## Cadastro

1. Usuário envia dados da empresa/responsável/plano/preferência de pagamento.
2. Sistema cria `Company` e `User(owner)`.
3. Sistema roda verificação de CNPJ (BrasilAPI) e atualiza `verificationStatus`.
4. Sistema grava:
   - `preferredBillingType`
   - `preferredBillingPeriod`
   - `approvalStatus = pending`
5. Não gera cobrança no Asaas nesse momento.

## Aprovação operacional

1. Admin aprova empresa no painel.
2. Endpoint admin:
   - valida estado atual;
   - se necessário, cria billing no Asaas com preferências salvas;
   - persiste `approvalStatus = approved`.
3. Se cobrança falhar, aprovação retorna erro.

## Pagamento e desbloqueio

1. Usuário aprovado entra em `/aguardando-pagamento`.
2. Vê link do Asaas para pagar (quando houver cobrança pendente).
3. Após confirmação:
   - via webhook Asaas, ou
   - fallback de sincronização no endpoint de payment link
4. `billingStatus` torna-se `active`.
5. Layouts buyer/seller liberam acesso.

## 2) Regras de acesso por estado

## Gate de navegação

- `approvalStatus != approved` -> permanece em `/aguardando-pagamento`.
- `approvalStatus == approved` + `billingStatus != active` -> permanece em `/aguardando-pagamento`.
- `billingManuallyApproved == true` -> bypass operacional (liberação manual).

## Gate de APIs de marketplace

- Requests/proposals exigem:
  - sessão válida;
  - empresa compatível com ação (`buyer` ou `seller`);
  - CNPJ aprovado (`verificationStatus = approved`);
  - limite de plano disponível.

## 3) Regras de billing por método

O método escolhido é persistido e usado na criação da assinatura Asaas:

- `PIX`
- `BOLETO`
- `CREDIT_CARD`

Estratégia atual:
- todos os métodos usam checkout hospedado no Asaas;
- JADA exibe link de pagamento e status;
- dados sensíveis de cartão não trafegam pelo backend da JADA.

## 4) Fluxo requests/proposals

## Requests

- criação permitida para `buyer`/`both`;
- request nasce com status `open`;
- vendedores podem listar oportunidades públicas.

## Proposals

- criação permitida para `seller`/`both`;
- vendedor não pode propor para pedido da própria empresa;
- não pode duplicar proposta da mesma empresa para o mesmo pedido;
- aceite de proposta só pelo comprador dono da requisição.

## 5) Limites de plano

Validados em runtime com base em `Company.plan`:

- máximo de usuários da empresa;
- máximo de requisições por mês;
- máximo de propostas por mês.

Quando o limite é atingido, API retorna erro de negócio (status 4xx).

## 6) Eventos e estado de cobrança

Webhook Asaas mapeia eventos para estado interno:

- `PAYMENT_CONFIRMED`/`PAYMENT_RECEIVED`/`CHECKOUT_PAID` -> `active`
- `PAYMENT_OVERDUE` -> `past_due`
- `SUBSCRIPTION_INACTIVATED`/`SUBSCRIPTION_DELETED` -> `canceled`

Eventos são auditados em `BillingEvent`.
