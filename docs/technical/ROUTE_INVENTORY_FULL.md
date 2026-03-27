# Full Route Inventory (with source files)

Inventário técnico completo das rotas identificadas no App Router.

## 1) App pages

| Route | Source file |
|---|---|
| `/` | `app/page.tsx` |
| `/about` | `app/about/page.tsx` |
| `/contact` | `app/contact/page.tsx` |
| `/faq` | `app/faq/page.tsx` |
| `/plans` | `app/plans/page.tsx` |
| `/privacy` | `app/privacy/page.tsx` |
| `/terms` | `app/terms/page.tsx` |
| `/login` | `app/login/page.tsx` |
| `/signup` | `app/signup/page.tsx` |
| `/forgot-password` | `app/forgot-password/page.tsx` |
| `/reset-password` | `app/reset-password/page.tsx` |
| `/aguardando-pagamento` | `app/aguardando-pagamento/page.tsx` |
| `/admin/dashboard` | `app/admin/dashboard/page.tsx` |
| `/admin/companies` | `app/admin/companies/page.tsx` |
| `/admin/plans` | `app/admin/plans/page.tsx` |
| `/admin/financial` | `app/admin/financial/page.tsx` |
| `/admin/profile` | `app/admin/profile/page.tsx` |
| `/buyer/dashboard` | `app/buyer/dashboard/page.tsx` |
| `/buyer/profile` | `app/buyer/profile/page.tsx` |
| `/buyer/users` | `app/buyer/users/page.tsx` |
| `/buyer/requests` | `app/buyer/requests/page.tsx` |
| `/buyer/requests/[id]` | `app/buyer/requests/[id]/page.tsx` |
| `/buyer/create-request` | `app/buyer/create-request/page.tsx` |
| `/buyer/subscription` | `app/buyer/subscription/page.tsx` |
| `/seller/dashboard` | `app/seller/dashboard/page.tsx` |
| `/seller/profile` | `app/seller/profile/page.tsx` |
| `/seller/users` | `app/seller/users/page.tsx` |
| `/seller/opportunities` | `app/seller/opportunities/page.tsx` |
| `/seller/opportunities/[id]` | `app/seller/opportunities/[id]/page.tsx` |
| `/seller/proposals` | `app/seller/proposals/page.tsx` |
| `/seller/settings` | `app/seller/settings/page.tsx` |
| `/seller/subscription` | `app/seller/subscription/page.tsx` |

## 2) Layouts and middleware

| Scope | Source file | Purpose |
|---|---|---|
| App root | `app/layout.tsx` | providers/metadata |
| Buyer area | `app/buyer/layout.tsx` | gate por aprovacao + billing |
| Seller area | `app/seller/layout.tsx` | gate por aprovacao + billing |
| Protected matcher | `middleware.ts` | login + role admin em `/admin/*` |

## 3) API route handlers

| API Path | Methods | Source file |
|---|---|---|
| `/api/auth/[...nextauth]` | GET, POST | `app/api/auth/[...nextauth]/route.ts` |
| `/api/auth/signup` | POST | `app/api/auth/signup/route.ts` |
| `/api/auth/signup-with-billing` | POST | `app/api/auth/signup-with-billing/route.ts` |
| `/api/auth/forgot-password` | POST | `app/api/auth/forgot-password/route.ts` |
| `/api/auth/reset-password` | POST | `app/api/auth/reset-password/route.ts` |
| `/api/plans` | GET | `app/api/plans/route.ts` |
| `/api/company` | GET, PATCH | `app/api/company/route.ts` |
| `/api/company/users` | GET, POST | `app/api/company/users/route.ts` |
| `/api/company/subscription` | GET | `app/api/company/subscription/route.ts` |
| `/api/company/payment-link` | GET | `app/api/company/payment-link/route.ts` |
| `/api/requests` | GET, POST | `app/api/requests/route.ts` |
| `/api/requests/[id]` | GET, PATCH | `app/api/requests/[id]/route.ts` |
| `/api/proposals` | GET | `app/api/proposals/route.ts` |
| `/api/proposals/create` | POST | `app/api/proposals/create/route.ts` |
| `/api/proposals/accept` | POST | `app/api/proposals/accept/route.ts` |
| `/api/billing/asaas/subscribe` | POST | `app/api/billing/asaas/subscribe/route.ts` |
| `/api/webhooks/asaas` | POST | `app/api/webhooks/asaas/route.ts` |
| `/api/admin/stats` | GET | `app/api/admin/stats/route.ts` |
| `/api/admin/financial` | GET | `app/api/admin/financial/route.ts` |
| `/api/admin/plans` | GET, POST | `app/api/admin/plans/route.ts` |
| `/api/admin/plans/[id]` | GET, PATCH, DELETE | `app/api/admin/plans/[id]/route.ts` |
| `/api/admin/companies` | GET | `app/api/admin/companies/route.ts` |
| `/api/admin/companies/[id]` | GET, PATCH | `app/api/admin/companies/[id]/route.ts` |
| `/api/admin/companies/[id]/verify` | POST | `app/api/admin/companies/[id]/verify/route.ts` |
