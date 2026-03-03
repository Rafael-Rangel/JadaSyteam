-- Add verification columns to Company
ALTER TABLE "Company" ADD COLUMN "verificationStatus" TEXT NOT NULL DEFAULT 'pending';
ALTER TABLE "Company" ADD COLUMN "verifiedAt" TIMESTAMP(3);
ALTER TABLE "Company" ADD COLUMN "verificationPayload" JSONB;

-- Backfill: companies with null cnpj get placeholder so we can make cnpj NOT NULL
UPDATE "Company" SET "cnpj" = '00000000000000' WHERE "cnpj" IS NULL OR TRIM("cnpj") = '';

-- Make cnpj required
ALTER TABLE "Company" ALTER COLUMN "cnpj" SET NOT NULL;
