# Jada Platform

Plataforma de cotação onde compradores publicam necessidades e vendedores enviam propostas.

## Pré-requisitos

- Node.js 18+
- npm

## Instalação

```bash
npm install
```

## Execução

**Desenvolvimento:**

```bash
npm run dev
```

Aplicação em http://localhost:3000

**Produção:**

```bash
npm run build
npm run start
```

## Scripts

| Script   | Comando        | Descrição                          |
|----------|----------------|------------------------------------|
| dev      | `next dev`     | Servidor de desenvolvimento         |
| build    | `next build`   | Build de produção                  |
| start    | `next start`   | Servidor de produção (após build)  |
| lint     | `next lint`    | Linter                             |

## Stack

- Next.js 14.2.5 (App Router)
- React 18
- TypeScript
- TailwindCSS
- React Icons
- Lucide React

## Estrutura do projeto

```
/
├── app/                         # App Router (layout, páginas, APIs, globals.css)
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   ├── api/                     # auth, company, requests, proposals, admin (stats, companies, plans, financial)
│   ├── plans/
│   ├── login/
│   ├── signup/
│   ├── about/
│   ├── faq/
│   ├── contact/
│   ├── terms/
│   ├── privacy/
│   ├── forgot-password/
│   ├── buyer/                   # dashboard, create-request, requests, requests/[id], users, profile, subscription
│   ├── seller/                  # dashboard, opportunities, opportunities/[id], proposals, settings, users, profile, subscription
│   └── admin/                   # dashboard, companies, plans, financial
├── components/                  # Header, Footer, Button, Input, Modal, Card, Providers
├── lib/                         # auth (NextAuth), prisma (cliente DB), plans (limites)
├── types/                       # next-auth.d.ts (tipos estendidos)
├── prisma/                      # schema.prisma, migrations
├── public/                      # logo.jpg, mascote.png (assets estáticos)
├── next.config.js
├── middleware.ts                # proteção de rotas (buyer, seller, admin)
├── prisma.config.ts
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
└── package.json
```

Estilos globais ficam em `app/globals.css`.

## Layout

Existe um único layout em `app/layout.tsx`. Não há `layout.tsx` em `buyer/`, `seller/` ou `admin/`.

## Rotas

### Públicas

| Rota              | Arquivo                    |
|-------------------|----------------------------|
| /                 | app/page.tsx               |
| /plans            | app/plans/page.tsx         |
| /login            | app/login/page.tsx         |
| /signup           | app/signup/page.tsx        |
| /about            | app/about/page.tsx         |
| /faq              | app/faq/page.tsx           |
| /contact          | app/contact/page.tsx       |
| /terms            | app/terms/page.tsx         |
| /privacy          | app/privacy/page.tsx       |
| /forgot-password  | app/forgot-password/page.tsx |

### Comprador

| Rota                      | Arquivo                              |
|---------------------------|--------------------------------------|
| /buyer/dashboard          | app/buyer/dashboard/page.tsx         |
| /buyer/create-request     | app/buyer/create-request/page.tsx    |
| /buyer/requests           | app/buyer/requests/page.tsx         |
| /buyer/requests/[id]      | app/buyer/requests/[id]/page.tsx    |
| /buyer/users              | app/buyer/users/page.tsx             |
| /buyer/profile            | app/buyer/profile/page.tsx           |
| /buyer/subscription       | app/buyer/subscription/page.tsx      |

### Vendedor

| Rota                            | Arquivo                                    |
|---------------------------------|--------------------------------------------|
| /seller/dashboard               | app/seller/dashboard/page.tsx              |
| /seller/opportunities           | app/seller/opportunities/page.tsx          |
| /seller/opportunities/[id]      | app/seller/opportunities/[id]/page.tsx     |
| /seller/proposals               | app/seller/proposals/page.tsx              |
| /seller/settings                | app/seller/settings/page.tsx               |
| /seller/users                   | app/seller/users/page.tsx                  |
| /seller/profile                 | app/seller/profile/page.tsx                |

### Admin

| Rota                | Arquivo                          |
|---------------------|-----------------------------------|
| /admin/dashboard    | app/admin/dashboard/page.tsx      |
| /admin/companies    | app/admin/companies/page.tsx      |
| /admin/plans        | app/admin/plans/page.tsx          |
| /admin/financial    | app/admin/financial/page.tsx      |

## Produção e banco de dados

A aplicação usa **apenas Supabase (PostgreSQL)**; não há banco local. Está preparada para produção com `npm run build` e `npm run start`.

### Checklist para produção

1. **Variáveis de ambiente** (copie `.env.example` para `.env` e ajuste):
   - `NEXTAUTH_SECRET`: gere um valor forte (ex.: `openssl rand -base64 32`). **Não use** o valor de desenvolvimento.
   - `NEXTAUTH_URL`: URL pública com HTTPS (ex.: `https://seu-dominio.com`).
   - `DATABASE_URL`: connection string do Supabase (Settings > Database > Connection string). Use Session mode (porta 5432). Senha: `#` = `%23`, `@` = `%40`.

2. **Banco Supabase:** o schema usa `provider = "postgresql"` e a URL vem de `DATABASE_URL`. No servidor de produção: `npx prisma generate` e `npx prisma migrate deploy`.

3. **Segurança:** o `.env` não deve ser commitado (está no `.gitignore`). O middleware protege `/admin/*`: apenas usuários com `role === 'admin'` acessam.

4. **HTTPS:** sirva a aplicação atrás de HTTPS (proxy reverso, Vercel, etc.).

5. **Assets:** garanta que `public/` contenha `logo.jpg` e `mascote.png` para Header, Footer e páginas de login/signup.

6. **Primeiro usuário admin:** não há tela de cadastro de admin. Para criar o primeiro admin, cadastre uma empresa normalmente pelo signup, depois no Supabase (SQL Editor ou Table Editor) altere o `role` do usuário para `admin`:
   ```sql
   UPDATE "User" SET role = 'admin' WHERE email = 'seu-email@exemplo.com';
   ```
   Após isso, faça login com esse e-mail; o middleware permitirá acesso a `/admin/*`.

7. **Contato (FormSubmit):** o formulário em `/contact` envia mensagens para o e-mail da JADA via [FormSubmit](https://formsubmit.co). Use o e-mail desejado (ex.: contato@jada.com.br); o primeiro envio ativa o endereço no FormSubmit.

8. **Esqueci minha senha (Resend):** a recuperação de senha envia e-mail com link de reset via [Resend](https://resend.com). No `.env`: `RESEND_API_KEY` (API Key do Resend) e `RESEND_FROM_EMAIL` (use `onboarding@resend.dev` para testes). Rode `npx prisma migrate deploy` para criar a tabela de tokens.

### Itens opcionais (pós-lançamento)

- **Financeiro:** a tela admin Financeiro mostra receita estimada por plano (assinaturas); integração com gateway de pagamento para pagamentos reais é futura.
- Pagamento e cancelamento de assinatura (telas buyer/seller) estão com mensagem “em breve”; integração com gateway de pagamento é futura.

### Plano de testes

Ver [docs/TESTES.md](docs/TESTES.md) para o checklist de testes por fluxo (público, comprador, vendedor, admin) antes de colocar em produção.