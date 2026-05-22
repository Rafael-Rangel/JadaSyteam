-- AlterTable
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "restrictToAssignedCompanies" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE IF NOT EXISTS "AssistantCompanyAssignment" (
    "id" TEXT NOT NULL,
    "assistantUserId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "assignedByUserId" TEXT,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AssistantCompanyAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "AssistantAuditLog" (
    "id" TEXT NOT NULL,
    "assistantUserId" TEXT NOT NULL,
    "companyId" TEXT,
    "action" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AssistantAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "AssistantCompanyAssignment_assistantUserId_companyId_key" ON "AssistantCompanyAssignment"("assistantUserId", "companyId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "AssistantCompanyAssignment_assistantUserId_idx" ON "AssistantCompanyAssignment"("assistantUserId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "AssistantCompanyAssignment_companyId_idx" ON "AssistantCompanyAssignment"("companyId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "AssistantAuditLog_assistantUserId_createdAt_idx" ON "AssistantAuditLog"("assistantUserId", "createdAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "AssistantAuditLog_companyId_createdAt_idx" ON "AssistantAuditLog"("companyId", "createdAt");

-- AddForeignKey
DO $$ BEGIN
 ALTER TABLE "AssistantCompanyAssignment" ADD CONSTRAINT "AssistantCompanyAssignment_assistantUserId_fkey" FOREIGN KEY ("assistantUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "AssistantCompanyAssignment" ADD CONSTRAINT "AssistantCompanyAssignment_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "AssistantCompanyAssignment" ADD CONSTRAINT "AssistantCompanyAssignment_assignedByUserId_fkey" FOREIGN KEY ("assignedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "AssistantAuditLog" ADD CONSTRAINT "AssistantAuditLog_assistantUserId_fkey" FOREIGN KEY ("assistantUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
