-- CreateTable
CREATE TABLE "Plan" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "usersLimit" INTEGER NOT NULL,
    "requestsPerMonthLimit" INTEGER NOT NULL,
    "proposalsPerMonthLimit" INTEGER NOT NULL,
    "description" TEXT,
    "features" JSONB,
    "popular" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Plan_slug_key" ON "Plan"("slug");

-- Seed: planos iniciais (starter, growth, enterprise)
INSERT INTO "Plan" ("id", "slug", "name", "price", "usersLimit", "requestsPerMonthLimit", "proposalsPerMonthLimit", "description", "features", "popular", "active", "sortOrder", "createdAt", "updatedAt") VALUES
(
  'plan_seed_starter',
  'starter',
  'Starter',
  49,
  3,
  20,
  100,
  'Ideal para empresas pequenas',
  '["3 usuários por empresa","20 requisições/mês (comprador)","100 propostas/mês (vendedor)","Raio padrão: 20km (configurável)","3 categorias desbloqueadas","Relatórios básicos","Suporte por e-mail (48h)"]'::jsonb,
  false,
  true,
  0,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
),
(
  'plan_seed_growth',
  'growth',
  'Growth',
  199,
  10,
  200,
  1000,
  'Para empresas em crescimento',
  '["10 usuários por empresa","200 requisições/mês (comprador)","1.000 propostas/mês (vendedor)","Raio padrão: 50km (configurável)","10 categorias desbloqueadas","Destaque de requisição (limitado)","Export CSV","Integrações básicas de ERP","Suporte e-mail + chat (horário comercial)"]'::jsonb,
  true,
  true,
  1,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
),
(
  'plan_seed_enterprise',
  'enterprise',
  'Enterprise',
  799,
  100,
  99999,
  99999,
  'Solução completa para grandes empresas',
  '["Usuários ilimitados","Requisições ilimitadas","Propostas ilimitadas","Raio ilimitado (configurável)","Todas as categorias desbloqueadas","Integração via API","SSO/LDAP","SLA de suporte","Relatórios avançados","Conta dedicada","Suporte prioritário"]'::jsonb,
  false,
  true,
  2,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);
