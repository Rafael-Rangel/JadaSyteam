ALTER TABLE "Company"
ADD COLUMN "riskLevel" TEXT DEFAULT 'unknown',
ADD COLUMN "lastDueDiligenceAt" TIMESTAMP(3),
ADD COLUMN "judicialFlags" JSONB,
ADD COLUMN "serasaScore" INTEGER,
ADD COLUMN "serasaCheckedAt" TIMESTAMP(3);

CREATE TABLE "DueDiligenceReport" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "kind" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "summary" JSONB,
  "payload" JSONB,
  "score" INTEGER,
  "riskLevel" TEXT,
  "expiresAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "DueDiligenceReport_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "DueDiligenceReport_companyId_provider_kind_createdAt_idx"
ON "DueDiligenceReport"("companyId", "provider", "kind", "createdAt");

CREATE INDEX "DueDiligenceReport_companyId_createdAt_idx"
ON "DueDiligenceReport"("companyId", "createdAt");

ALTER TABLE "DueDiligenceReport"
ADD CONSTRAINT "DueDiligenceReport_companyId_fkey"
FOREIGN KEY ("companyId") REFERENCES "Company"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
