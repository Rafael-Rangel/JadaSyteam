-- Add manual approval flag for billing (allow access before webhook)
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "billingManuallyApproved" BOOLEAN DEFAULT false;
