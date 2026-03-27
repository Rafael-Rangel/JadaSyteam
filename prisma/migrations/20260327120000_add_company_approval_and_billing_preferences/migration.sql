ALTER TABLE "Company"
ADD COLUMN "preferredBillingType" TEXT,
ADD COLUMN "preferredBillingPeriod" TEXT,
ADD COLUMN "approvalStatus" TEXT NOT NULL DEFAULT 'pending';
