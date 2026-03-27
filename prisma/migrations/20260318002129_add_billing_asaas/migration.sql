-- Add billing fields to Company
ALTER TABLE "Company"
  ADD COLUMN     "billingProvider" TEXT,
  ADD COLUMN     "billingStatus" TEXT,
  ADD COLUMN     "billingCycle" TEXT,
  ADD COLUMN     "billingCustomerId" TEXT,
  ADD COLUMN     "billingSubscriptionId" TEXT,
  ADD COLUMN     "billingNextDueDate" TIMESTAMP(3),
  ADD COLUMN     "billingLastEventAt" TIMESTAMP(3),
  ADD COLUMN     "billingLastPayload" JSONB;

-- Create BillingEvent table
CREATE TABLE "BillingEvent" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "eventType" TEXT NOT NULL,
  "externalId" TEXT,
  "payload" JSONB,
  "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "BillingEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "BillingEvent_companyId_receivedAt_idx" ON "BillingEvent"("companyId", "receivedAt");

ALTER TABLE "BillingEvent" ADD CONSTRAINT "BillingEvent_companyId_fkey"
  FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

