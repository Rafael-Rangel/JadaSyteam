# Overview: fluxos de usuários e área admin

## 1. Visão geral dos fluxos de usuários

```mermaid
flowchart TB
  subgraph publico [Público]
    A[Landing /]
    B[Login]
    C[Signup]
    D[Planos]
    E[Esqueci senha / Sobre / FAQ / Contato]
  end
  subgraph signup [Signup]
    C --> C1[Empresa: nome, CNPJ, tipo]
    C1 --> C2[Dono: nome, email, telefone, senha]
    C2 --> C3[Plano: starter/growth/enterprise]
    C3 --> API_Signup[POST /api/auth/signup]
    API_Signup --> DB[(Supabase)]
  end
  subgraph login [Login]
    B --> NextAuth[NextAuth Credentials]
    NextAuth --> DB
  end
  subgraph buyer [Comprador]
    BD[B buyer/dashboard]
    BR[B buyer/requests]
    BC[B buyer/create-request]
    BU[B buyer/users]
    BP[B buyer/profile]
    BSub[B buyer/subscription]
  end
  subgraph seller [Vendedor]
    SD[S seller/dashboard]
    SO[S seller/opportunities]
    SP[S seller/proposals]
    SU[S seller/users]
    SSet[S seller/settings]
    SSub[S seller/subscription]
  end
  subgraph admin [Admin]
    AD[Admin dashboard]
    AC[Admin companies]
    AP[Admin plans]
    AF[Admin financial]
  end
  NextAuth --> Session[Sessão JWT: id, companyId, role, companyType]
  Session --> buyer
  Session --> seller
  Session --> admin
  Session --> |role !== admin| RedirectBuyer[/buyer/dashboard]
  Session --> |role === admin| AdminOK[admin/*]
```

---

## 2. Fluxo por tipo de conta

### 2.1 Cadastro (Signup)

- **Rota:** `/signup` (público).
- **Passos:** (1) Dados da empresa (nome, CNPJ, tipo: buyer/seller/both), (2) Dados do dono (nome, email, telefone, senha), (3) Escolha do plano (starter/growth/enterprise).
- **API:** `POST /api/auth/signup` cria **Company** (type, plan) e **User** (role = `owner`) no Supabase; senha em bcrypt.
- **Resultado:** usuário dono da empresa, com `companyType` e `plan` definidos.

### 2.2 Login

- **Rota:** `/login` (público).
- **API:** NextAuth Credentials → valida email/senha no Prisma, retorna JWT com `id`, `companyId`, `role`, `companyType`.
- **Middleware:** quem acessa `/buyer/*`, `/seller/*` ou `/admin/*` sem sessão é redirecionado para `/login`. Quem acessa `/admin/*` sem `role === 'admin'` vai para `/buyer/dashboard`.

### 2.3 Comprador (buyer)

- **Acesso:** usuário com `companyType === 'buyer'` ou `'both'` (e que entra pela área buyer).
- **Rotas:** dashboard, requests, create-request, users, profile, subscription.
- **APIs usadas:**  
  - `GET/PATCH /api/company` (dados da empresa).  
  - `GET/POST /api/requests` (listar/criar requisições; criação respeita limite do plano via `lib/plans.ts`).  
  - `GET /api/requests/[id]`.  
  - `GET /api/company/users`, `POST /api/company/users` (respeitam limite de usuários do plano).  
  - `GET /api/company/subscription` (uso atual vs limites e nome/preço do plano).
- **Planos:** limites (usuários, requisições/mês) vêm de `lib/plans.ts`; o plano da empresa está em `Company.plan` no banco.

### 2.4 Vendedor (seller)

- **Acesso:** usuário com `companyType === 'seller'` ou `'both'`.
- **Rotas:** dashboard, opportunities, opportunities/[id], proposals, users, settings, profile, subscription.
- **APIs usadas:**  
  - `GET /api/company`, `GET /api/company/subscription`.  
  - `GET /api/requests` (oportunidades abertas).  
  - `GET /api/proposals`, `POST /api/proposals/create` (respeita limite de propostas/mês do plano).  
  - `POST /api/proposals/accept`.  
  - `GET /api/company/users`, `POST /api/company/users`.
- **Planos:** mesmo `lib/plans.ts` e `Company.plan`; subscription mostra uso (propostas/mês, etc.).

### 2.5 Admin

- **Acesso:** apenas usuário com `role === 'admin'` (definido no banco; não há tela de cadastro de admin).
- **Rotas:** dashboard, companies, plans, financial.
- **Proteção:** middleware exige login e `role === 'admin'` para `/admin/*`.

---

## 3. Foco: área admin e controle de planos

### 3.1 O que está correto (funcionando)

- **Proteção de rotas:** só usuário com `role === 'admin'` acessa `/admin/*`.
- **APIs de comprador/vendedor:** todas usam sessão e respeitam `Company.plan` e `getPlanLimits(company.plan)` para limites (usuários, requisições/mês, propostas/mês).
- **Fonte única de limites:** `lib/plans.ts` (`PLAN_LIMITS`: starter, growth, enterprise). Preços exibidos vêm de `company/subscription` (hardcoded no backend).
- **Banco:** Company tem `plan` (string); não existe tabela “Plan” no Prisma. Planos são um conjunto fixo no código.

### 3.2 Admin com dados reais (implementado)

- **Admin Dashboard:** `GET /api/admin/stats` retorna totais (empresas, usuários, requisições/mês, propostas/mês, faturamento estimado) e últimas empresas. A página consome a API e exibe dados reais.
- **Admin Empresas:** `GET /api/admin/companies` lista empresas do banco (com filtros opcionais). `PATCH /api/admin/companies/[id]` permite alterar o plano da empresa. A página lista dados reais e oferece “Alterar plano”.
- **Admin Planos:** `GET /api/admin/plans` retorna os planos (limites e preços de `lib/plans.ts`). A tela é somente leitura; para alterar o plano de uma empresa, usa-se a tela Empresas.
- **Admin Financeiro:** `GET /api/admin/financial` retorna receita estimada por plano e lista de assinaturas. A tela exibe dados reais; integração com gateway de pagamento é futura.

### 3.3 Controle de planos

- **Limites e preços:** `lib/plans.ts` (PLAN_LIMITS, PLAN_PRICES, PLAN_NAMES); usados em subscription e em todas as APIs admin.
- **Plano da empresa:** campo `Company.plan` no Supabase. O admin altera pela tela Empresas (PATCH /api/admin/companies/[id]).
- **Criar primeiro admin:** não há cadastro pela aplicação; definir no banco: `UPDATE "User" SET role = 'admin' WHERE email = '...';` (ver README).

---

## 4. Resumo rápido

- **Fluxo geral (signup, login, buyer, seller):** correto; usa Supabase, sessão e limites de plano.
- **Admin – rotas e proteção:** apenas `role === 'admin'` acessa `/admin/*`.
- **Admin – conteúdo:** dashboard, empresas, planos e financeiro usam **APIs reais** (`/api/admin/stats`, `/api/admin/companies`, `/api/admin/plans`, `/api/admin/financial`). O admin pode alterar o plano de uma empresa pela tela Empresas.
- **Controle de planos:** limites e preços em `lib/plans.ts`; plano da empresa em `Company.plan`; alteração via Admin > Empresas > Alterar plano.
- **Primeiro admin:** criar usuário pelo signup e depois no Supabase executar `UPDATE "User" SET role = 'admin' WHERE email = '...';` (ver README).
