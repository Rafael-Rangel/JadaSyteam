# Cobrança, planos e gateways de pagamento – visão geral

Este documento explica de forma simples: tipo de mercado, tipos de usuário, planos, ciclos de cobrança (mensal, 6 meses, anual), como administrar a cobrança no backend, webhooks e como trocar de gateway com pouca manutenção.

---

## 1. Tipo de mercado

A JADA é uma **plataforma B2B** (empresa para empresa):

- **Compradores** (buyers): empresas que publicam necessidades de compra (requisições).
- **Vendedores** (sellers): empresas que veem essas necessidades (oportunidades) e enviam propostas.
- Uma mesma empresa pode ser **compradora e vendedora** (tipo `both`).

Ou seja: é um **marketplace de cotações** entre empresas. A receita da plataforma vem da **assinatura (planos)** que cada empresa paga para usar o sistema, não da transação entre comprador e vendedor.

---

## 2. Tipos de usuário (e papéis)

| Camada | Valores | Onde fica | Uso |
|--------|--------|-----------|-----|
| **Tipo de empresa** | `buyer`, `seller`, `both` | `Company.type` | Define se a empresa pode criar requisições, enviar propostas ou os dois. |
| **Papel do usuário** | `owner`, `manager`, `employee` (comprador) ou `owner`, `manager`, `seller` (vendedor) / `admin` | `User.role` | Quem é dono, gerente ou colaborador; admin é da plataforma. |

- **Admin**: gerencia a plataforma (empresas, planos, financeiro, aprovação de CNPJ). Não é “cliente” que paga.
- **Owner/Manager/Employee**: usuários da empresa cliente; a **empresa** tem um plano e a cobrança é por empresa (plano), não por usuário individual.

Resumo: **cobrança = 1 plano por empresa**. Os usuários da empresa usam os limites desse plano (número de usuários, requisições/mês, propostas/mês).

---

## 3. Planos hoje vs no futuro

### 3.1 Hoje (fictícios)

- Planos no banco: **Starter, Growth, Enterprise** (slug: `starter`, `growth`, `enterprise`).
- Cada plano tem: nome, preço (R$), limites (usuários, requisições/mês, propostas/mês), descrição, features.
- O “preço” hoje é só informativo: **não há cobrança real**, não há gateway integrado.
- A empresa escolhe um plano no cadastro e esse plano fica salvo em `Company.plan`; os limites são aplicados nas APIs.

### 3.2 No futuro (com cobrança real)

- Haverá **mais planos** (quantos e quais você definir no admin).
- Cada plano pode ser oferecido em **mais de um ciclo de cobrança**:
  - **Mensal**: cobrança todo mês.
  - **Semestral (6 meses)**: cobrança a cada 6 meses (geralmente com desconto).
  - **Anual**: cobrança uma vez por ano (geralmente com desconto).
- O valor e o ciclo (mensal / 6 meses / anual) precisam estar definidos no backend e na tela de planos/checkout.

Ou seja: **um mesmo “plano” (ex.: Growth) pode ter preço mensal, preço semestral e preço anual**. No banco e no fluxo, tratamos isso como “assinatura” com ciclo (billing cycle).

---

## 4. Ciclos de cobrança (billing cycle)

| Ciclo | Descrição | Exemplo |
|-------|-----------|--------|
| **Mensal** | Cobrança a cada 30 dias (ou dia fixo do mês). | R$ 199/mês. |
| **6 meses** | Cobrança a cada 6 meses. | R$ 999 a cada 6 meses. |
| **Anual** | Cobrança uma vez por ano. | R$ 1.999/ano. |

No backend, para cada “oferta” (plano + ciclo) guardamos:

- Qual plano (slug).
- Qual ciclo (mensal, semestral, anual).
- Preço para esse ciclo.
- (Opcional) ID do produto/preço no gateway (Stripe, Mercado Pago, etc.), para não depender só do nome.

Assim você consegue **administrar a cobrança no backend**: criar/editar planos e preços por ciclo no admin, e o gateway é só o “cobrador” que segue o que está no seu sistema.

---

## 5. O que é “administrar a cobrança no backend”

Significa:

1. **Fonte da verdade no seu banco**
   - Planos, preços por ciclo, limites e “quem está em qual plano” ficam no **seu** banco (tabelas Plan, Subscription, etc.).
   - O gateway (Stripe, Mercado Pago, etc.) é usado para **cobrar** e **avisar** (webhook), não para definir o que você vende.

2. **Fluxo típico**
   - Cliente escolhe plano + ciclo na sua aplicação.
   - Backend cria (ou atualiza) a **assinatura** no seu banco e chama o gateway para “criar cobrança/assinatura lá”.
   - O gateway processa o pagamento e envia um **webhook** (“pagamento confirmado”, “falhou”, “renovado”, etc.).
   - Seu backend **recebe o webhook**, confere a assinatura/cobrança e **atualiza o status no seu banco** (ativo, em atraso, cancelado, próxima renovação em tal data).

3. **Vantagem**
   - Trocar de gateway não muda “quais planos existem” nem “quem está em qual plano”; só muda “quem cobra” e “quem manda o aviso” (webhook).

---

## 6. O que é webhook (e por que precisa ser “correto”)

- **Webhook** = o gateway de pagamento chama **uma URL sua** quando algo acontece (ex.: “pagamento aprovado”, “assinatura cancelada”).
- Seu backend expõe uma rota, por exemplo: `POST /api/webhooks/payments` (ou `/api/webhooks/stripe`, `/api/webhooks/mercadopago`).

Para o webhook ser **correto** e seguro:

1. **Verificar que a requisição veio mesmo do gateway**
   - Usar **assinatura** (header com hash do corpo + segredo que só você e o gateway conhecem). Nunca confiar só em “quem chamou a URL”.

2. **Tratar os eventos que importam**
   - Ex.: `payment.succeeded`, `subscription.renewed`, `subscription.cancelled`.
   - Para cada evento: buscar a assinatura/cobrança no seu banco (por ID externo que você guardou) e atualizar status/data de renovação/etc.

3. **Resposta rápida (200)**
   - Processar o mínimo necessário e responder 200 rápido; trabalho pesado (e-mails, relatórios) pode ir para fila em background.

4. **Idempotência**
   - O mesmo evento pode ser reenviado. Usar um “id do evento” para não aplicar a mesma atualização duas vezes.

Assim a cobrança fica **sincronizada** com o que realmente aconteceu no gateway e você administra tudo pelo backend com base nesses eventos.

---

## 7. Trocar de gateway com menos manutenção (camada de abstração)

Se toda a lógica de “criar assinatura”, “cancelar”, “interpretar webhook” estiver **espalhada** com “if Stripe… else Mercado Pago…”, ao trocar de gateway você mexe em muitos arquivos.

A solução é ter **uma camada única** que fala “em termos do seu negócio” e **adaptadores** por gateway:

```
[ Sua aplicação ]
       |
       v
[ Serviço de cobrança (sua interface) ]
   - criarAssinatura(companyId, planSlug, ciclo)
   - cancelarAssinatura(subscriptionId)
   - processarWebhook(gateway, payload)
       |
       +-- [ Adaptador Stripe ]   --> Stripe API + eventos Stripe
       +-- [ Adaptador Mercado Pago ] --> MP API + eventos MP
       +-- [ Adaptador Outro ]    --> ...
```

- **Sua aplicação** só chama: “criar assinatura para esta empresa, este plano, este ciclo”.
- O **serviço de cobrança** decide qual gateway usar (config/env) e chama o adaptador.
- O **webhook** chega na rota do gateway (ex.: `/api/webhooks/stripe`), o adaptador **converte** o evento do gateway em um evento padrão (“pagamento_confirmado”, “assinatura_cancelada”) e o **serviço de cobrança** atualiza o banco.

Quando trocar de gateway:

- Você **troca ou adiciona** um adaptador.
- A lógica “o que fazer quando pagamento confirmar” (atualizar assinatura, renovar acesso) continua **uma só**, no serviço de cobrança.

Ou seja: **administrar a cobrança no backend** + **webhook correto** + **abstração por adaptador** = manutenção melhor ao mudar de gateway.

---

## 8. Resumo: o que precisamos no sistema

| Item | Descrição |
|------|-----------|
| **Planos** | Já existe (Plan no banco). Poder ter vários planos, editáveis no admin. |
| **Ciclos** | Adicionar suporte a **mensal**, **6 meses**, **anual** (e preço por ciclo). |
| **Assinatura** | Tabela (ou equivalente) ligando **Company** a **Plano + ciclo + status** (ativa, cancelada, em atraso) e datas (início, próxima cobrança). |
| **Gateway** | Integração com um gateway (ex.: Stripe ou Mercado Pago) para criar cobrança/assinatura e receber webhooks. |
| **Abstração** | Serviço de cobrança + adaptadores por gateway, para trocar de gateway sem reescrever toda a regra de negócio. |
| **Webhook** | Rota segura (verificação de assinatura), tratamento dos eventos importantes e atualização do status da assinatura no seu banco. |

---

## 9. Próximos passos sugeridos (ordem lógica)

1. **Modelo de dados**: criar modelo de **Subscription** (ou Billing) e **PlanPrice** (ou oferta: plano + ciclo + preço) no Prisma; manter Plan como está e associar preços por ciclo.
2. **Admin**: telas para CRUD de planos e de preços por ciclo (mensal, 6 meses, anual).
3. **Serviço de cobrança**: interface (TypeScript) + implementação “em memória” ou mock que só grava no banco, para você testar fluxo sem gateway.
4. **Adaptador do primeiro gateway**: ex.: Stripe ou Mercado Pago (criar assinatura, cancelar, mapear eventos para eventos internos).
5. **Rota de webhook**: `POST /api/webhooks/[gateway]` com verificação de assinatura e chamada ao serviço de cobrança para atualizar assinatura.
6. **Checkout na aplicação**: tela onde o cliente escolhe plano + ciclo e é redirecionado ao gateway (ou paga via link); após retorno, seu backend confirma com o webhook.

Se quiser, o próximo passo pode ser desenhar o **schema Prisma** (Subscription, PlanPrice) e os **nomes dos eventos** que o serviço de cobrança vai tratar (para ficar igual para qualquer gateway).
