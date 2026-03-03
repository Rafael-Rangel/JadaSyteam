# Plano de testes para produção

Objetivo: validar cada fluxo de usuário e recurso antes de considerar produção, sem depender de mocks.

## Pré-requisitos do ambiente de teste

- `.env` com `DATABASE_URL` (Supabase), `NEXTAUTH_SECRET`, `NEXTAUTH_URL` (ex.: `http://localhost:3000`).
- Banco com migrações aplicadas (`npx prisma migrate deploy`).
- Um usuário admin criado (signup + `UPDATE "User" SET role = 'admin' WHERE email = '...'` no Supabase).

---

## 1. Fluxo público (sem login)

| # | Etapa | Ação | Resultado esperado |
|---|--------|------|--------------------|
| 1 | Landing | Acessar `/` | Página inicial carrega; links Planos, Login, Signup visíveis. |
| 2 | Planos | Acessar `/plans` | Três planos (Starter, Growth, Enterprise) com preços e limites. |
| 3 | Login (sem conta) | Acessar `/login`, credenciais inválidas | Mensagem de erro; não redireciona. |
| 4 | Signup | Acessar `/signup`, preencher 3 passos (empresa, dono, plano), enviar | Redirect para login ou dashboard; empresa e usuário owner criados no Supabase. |
| 5 | Login (com conta) | Logar com e-mail/senha do signup | Redirect para `/buyer/dashboard` ou `/seller/dashboard` conforme tipo da empresa. |
| 6 | Contato | Acessar `/contact`, preencher e clicar em "Preparar e-mail" | Mensagem clara; opção de abrir e-mail com dados preenchidos (mailto). Sem sucesso falso. |
| 7 | Esqueci senha | Acessar `/forgot-password` | Mensagem de que recuperação estará em breve; links para Contato e Login. |
| 8 | Rotas estáticas | Acessar `/about`, `/faq`, `/terms`, `/privacy` | Páginas carregam sem erro. |

---

## 2. Fluxo comprador (buyer)

| # | Etapa | Ação | Resultado esperado |
|---|--------|------|--------------------|
| 9 | Dashboard | Logar como comprador, acessar `/buyer/dashboard` | Dados da empresa e resumo (requisições, etc.) se houver. |
| 10 | Nova requisição | `/buyer/create-request`, preencher e enviar | Requisição criada; aparece em `/buyer/requests`. |
| 11 | Listar requisições | `/buyer/requests` | Lista de requisições da empresa; busca funciona. |
| 12 | Detalhe requisição | Clicar em uma requisição | Página `/buyer/requests/[id]` com detalhes e propostas (se houver). |
| 13 | Aceitar proposta | Na página da requisição, aceitar uma proposta | Status da proposta atualizado; fluxo concluído. |
| 14 | Usuários | `/buyer/users`, adicionar usuário (respeitando limite do plano) | Usuário criado; aparece na lista. Tentar acima do limite: erro. |
| 15 | Perfil | `/buyer/profile`, alterar nome/telefone/endereço e salvar | PATCH /api/company ok; dados atualizados ao recarregar. |
| 16 | Assinatura | `/buyer/subscription` | Plano atual, limites e uso (requisições/mês, usuários) corretos; mensagem clara em "Alterar plano" (em breve). |

---

## 3. Fluxo vendedor (seller)

| # | Etapa | Ação | Resultado esperado |
|---|--------|------|--------------------|
| 17 | Dashboard | Logar como vendedor, `/seller/dashboard` | Dados e oportunidades resumidas. |
| 18 | Oportunidades | `/seller/opportunities` | Lista de requisições abertas (públicas); filtros/busca. |
| 19 | Enviar proposta | Entrar em uma oportunidade, preencher preço/prazo e enviar | Proposta criada; aparece em `/seller/proposals`. Respeito ao limite de propostas/mês do plano. |
| 20 | Minhas propostas | `/seller/proposals` | Lista de propostas da empresa. |
| 21 | Usuários | `/seller/users`, adicionar usuário (respeitando limite) | Usuário criado; erro se acima do limite. |
| 22 | Configurações | `/seller/settings`, alterar raio/categorias e salvar | PATCH /api/company ok; dados persistidos. |
| 23 | Perfil | `/seller/profile`, alterar e salvar | Persistido. |
| 24 | Assinatura | `/seller/subscription` | Plano, limites e uso (propostas/mês, etc.) corretos. |

---

## 4. Fluxo admin

| # | Etapa | Ação | Resultado esperado |
|---|--------|------|--------------------|
| 25 | Acesso negado | Usuário não-admin acessar `/admin/dashboard` | Redirect para `/buyer/dashboard`. |
| 26 | Dashboard | Logar como admin, `/admin/dashboard` | Cards com totais reais (empresas, usuários, requisições/mês, propostas/mês, faturamento estimado); lista de empresas recentes. |
| 27 | Empresas | `/admin/companies` | Lista de empresas do banco; filtros por tipo e plano. |
| 28 | Alterar plano | Na lista, "Alterar plano" em uma empresa, escolher outro plano e salvar | PATCH /api/admin/companies/[id] ok; plano da empresa atualizado no banco e na lista. |
| 29 | Planos | `/admin/plans` | Três planos com limites e preços (dados de lib/plans). |
| 30 | Financeiro | `/admin/financial` | Receita estimada total, por plano e lista de assinaturas (empresas) corretas. |

---

## 5. Regressão rápida pós-correções

Após qualquer alteração em Esqueci senha ou Contato, repetir os testes 6 e 7 para garantir que não há sucesso falso e que a mensagem exibida está correta.
