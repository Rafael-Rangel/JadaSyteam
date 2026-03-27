# Fluxo: Cadastro, Plano e Cobrança (Asaas)

Este documento explica **quem cria o quê**, **onde cada coisa fica** e **em que ordem** tudo acontece.

## Cadastro com aprovação antes da cobrança (fluxo atual)

O cadastro é feito **em sequência**: dados da empresa → dados do responsável → **plano + forma de pagamento + período** → confirmação. Ao confirmar, a conta é criada **sem gerar cobrança**. A empresa fica em **análise administrativa**. Quando o admin aprova, a JADA cria customer + assinatura no Asaas e exibe o link de pagamento para o cliente. O acesso operacional permanece bloqueado até `billingStatus = active` (webhook) ou liberação manual.

---

## 1. Visão geral

| Onde        | O que existe |
|------------|----------------|
| **Seu banco (JADA)** | Empresa (`Company`), usuários (`User`), plano da empresa (`Company.plan`), status de cobrança (`billingStatus`, `billingCustomerId`, `billingSubscriptionId`), eventos de billing (`BillingEvent`). |
| **Asaas**  | **Customer** (quem paga = a empresa), **Subscription** (assinatura com ciclo e valor), **Payment** (cobranças geradas pela assinatura). |

**Resposta direta:**  
- Você **não** cria “usuário” no Asaas. Cria **Customer** (representando a empresa) só quando o admin aprova e o sistema gera a cobrança.  
- Usuário e empresa são criados **só no seu banco** no cadastro.  
- A **cobrança** é criada e fica **no Asaas**; no seu sistema você guarda status e IDs (subscription, customer), além de preferência de pagamento/período escolhida no cadastro.

---

## 2. Passo a passo do fluxo

### Etapa A: Cadastro (Criar conta)

1. A pessoa acessa **Criar conta** (signup).
2. Preenche: dados da **empresa** (nome, CNPJ, tipo), **plano** (ex.: starter, professional), dados do **responsável** (nome, e-mail, telefone, senha).
3. O sistema:
   - Cria **uma linha na tabela `Company`** no seu banco (nome, CNPJ, tipo, **plan** = slug do plano escolhido, ex. `"starter"`). Ainda **não** envia nada para o Asaas.
   - (Opcional) Consulta CNPJ na Brasil API e atualiza `verificationStatus` na `Company`.
   - Cria **uma linha na tabela `User`** (e-mail, senha, nome, telefone, **role = owner**, **companyId** = id da empresa criada).
4. **Resultado:** empresa e dono existem **só no seu banco**. Plano está definido em `Company.plan`; preferências ficam em `preferredBillingType` e `preferredBillingPeriod`; `approvalStatus = pending`. Nenhum Customer/cobrança no Asaas ainda.

---

### Etapa B: Escolha do plano (quando acontece?)

- A escolha do plano é feita **no cadastro** (passo do formulário “Selecione o plano”).
- O plano fica salvo em **`Company.plan`** (slug, ex.: `"starter"`, `"professional"`).
- Não há “criar usuário no Asaas” nessa hora; Asaas ainda não entra.

---

### Etapa C: Aprovação admin e geração de cobrança

Quando o admin aprova a empresa:

1. **Backend (PATCH `/api/admin/companies/:id` com `approvalStatus=approved`):**
   - Lê a empresa e suas preferências salvas no cadastro.
   - Busca o plano por `Company.plan` para pegar nome e preço.
   - **Se a empresa ainda não tem `billingCustomerId`:**
     - Chama a API do Asaas: **cria um Customer** no Asaas com nome da empresa, CNPJ, e-mail e telefone do owner.
     - Salva o **id desse Customer** em `Company.billingCustomerId`.
   - Cria no Asaas uma **Subscription** (assinatura):
     - Customer = `billingCustomerId`,
     - Ciclo (mensal / semestral / anual),
     - Valor (baseado no preço do plano × ciclo),
     - `externalReference` = **id da Company** (para o webhook saber de qual empresa é).
   - Atualiza a **Company** no seu banco:
     - `billingProvider = 'asaas'`,
     - `billingStatus = 'pending'`,
     - `billingSubscriptionId` = id da assinatura no Asaas,
     - `billingNextDueDate`, etc.
   - Pede ao Asaas a lista de pagamentos da assinatura e pega o **primeiro** (a primeira cobrança).
   - Devolve para o front o **link de pagamento** (`invoiceUrl` ou `bankSlipUrl`).

2. **Onde fica a cobrança?**
   - A **cobrança** (valor, vencimento, PIX/boleto) é criada e armazenada **no Asaas** (como **Payment** da Subscription).
   - No seu banco você **não** guarda a “cobrança” em si; você guarda:
     - `billingSubscriptionId` (qual assinatura no Asaas),
     - `billingCustomerId` (qual “cliente” no Asaas),
     - `billingStatus`, `billingNextDueDate`, etc.

3. **Usuário:** faz login e acessa `/aguardando-pagamento`, onde encontra o botão para pagar no Asaas.

---

### Etapa D: Depois do pagamento (Webhook)

1. O **Asaas** envia um **webhook** para a sua URL (ex.: `https://seu-dominio/api/webhooks/asaas`) com o evento (ex.: `PAYMENT_RECEIVED`, `PAYMENT_CONFIRMED`).
2. Seu backend:
   - Valida o token (`asaas-access-token`).
   - Lê do payload o **subscription id** (e/ou `externalReference` = id da Company).
   - Acha a **Company** no seu banco (por `billingSubscriptionId` ou por `id` = externalReference).
   - Atualiza **`Company.billingStatus`** (ex.: `active` quando pago, `past_due` se vencido, `canceled` se assinatura cancelada).
   - Grava o evento na tabela **`BillingEvent`** (auditoria).

Assim você sabe no seu sistema se a empresa está com assinatura ativa, em atraso ou cancelada, sem precisar guardar a “cobrança” em si no seu banco.

---

## 3. Resumo: quem cria o quê e onde

| Ação / Dado              | No seu banco (JADA) | No Asaas |
|--------------------------|---------------------|----------|
| Cadastro (empresa + dono)| Cria `Company` e `User`; `Company.plan` = plano escolhido | Nada |
| Escolha do plano         | Já feita no signup → `Company.plan` | Nada |
| Primeira “Gerar cobrança”| Cria/atualiza `Company.billingCustomerId`; cria/atualiza `billingSubscriptionId`, `billingStatus`, etc. | Cria **Customer** (se ainda não existir); cria **Subscription**; Asaas gera a **Payment** (cobrança) |
| Cobrança (valor, link)   | Só referências (IDs, status) | **Payment** (cobrança) fica no Asaas |
| Pagamento confirmado    | Atualiza `Company.billingStatus` (via webhook); grava `BillingEvent` | Asaas envia webhook |

---

## 4. Respostas diretas às suas perguntas

- **“Tem que criar um usuário no Asaas?”**  
  Não. No Asaas a gente cria um **Customer** (quem paga = a empresa), não “usuário”. Esse Customer é criado quando a empresa é aprovada e a cobrança é gerada.

- **“Eu crio o usuário no banco de dados?”**  
  Sim. No **cadastro** você cria **Company** e **User** (owner) no seu banco. O Asaas não é usado no signup.

- **“A cobrança fica onde?”**  
  A cobrança (valor, vencimento, link PIX/boleto) fica **no Asaas** (objeto Payment da assinatura). No seu banco ficam só: IDs da assinatura e do customer, status (pending/active/past_due/canceled) e datas, para você saber se está pago e exibir na tela de assinatura.

- **“Como acontece?”**  
  Cadastro → tudo no seu banco (Company + User + plan + preferência de pagamento/período) e status pendente. Depois, quando o admin aprova → backend cria (se necessário) Customer e Subscription no Asaas e disponibiliza link de pagamento na plataforma. O usuário paga no Asaas. O webhook atualiza `billingStatus` para liberar o acesso.
