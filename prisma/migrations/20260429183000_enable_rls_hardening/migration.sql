-- Supabase RLS hardening for public schema tables used by the app.
-- Strategy:
-- 1) Enable RLS on all business tables
-- 2) Deny anon/authenticated by default
-- 3) Allow only Plan read access for anon/authenticated
-- 4) Keep backend access through privileged DB role/service role

-- Revoke direct table access from client roles.
REVOKE ALL ON TABLE "User" FROM anon, authenticated;
REVOKE ALL ON TABLE "Company" FROM anon, authenticated;
REVOKE ALL ON TABLE "Request" FROM anon, authenticated;
REVOKE ALL ON TABLE "Proposal" FROM anon, authenticated;
REVOKE ALL ON TABLE "BillingEvent" FROM anon, authenticated;
REVOKE ALL ON TABLE "PasswordResetToken" FROM anon, authenticated;
REVOKE ALL ON TABLE "DueDiligenceReport" FROM anon, authenticated;
REVOKE ALL ON TABLE "_prisma_migrations" FROM anon, authenticated;

-- Keep plan catalog readable for UI use-cases (if needed through Supabase API).
REVOKE ALL ON TABLE "Plan" FROM anon, authenticated;
GRANT SELECT ON TABLE "Plan" TO anon, authenticated;

-- Enable RLS.
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Company" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Request" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Proposal" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "BillingEvent" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PasswordResetToken" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DueDiligenceReport" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Plan" ENABLE ROW LEVEL SECURITY;

-- Remove previous policies if migration is replayed manually.
DROP POLICY IF EXISTS "plan_read_public" ON "Plan";
DROP POLICY IF EXISTS "service_role_all_user" ON "User";
DROP POLICY IF EXISTS "service_role_all_company" ON "Company";
DROP POLICY IF EXISTS "service_role_all_request" ON "Request";
DROP POLICY IF EXISTS "service_role_all_proposal" ON "Proposal";
DROP POLICY IF EXISTS "service_role_all_billing_event" ON "BillingEvent";
DROP POLICY IF EXISTS "service_role_all_password_reset_token" ON "PasswordResetToken";
DROP POLICY IF EXISTS "service_role_all_due_diligence_report" ON "DueDiligenceReport";
DROP POLICY IF EXISTS "service_role_all_plan" ON "Plan";

-- Public read for plan catalog only.
CREATE POLICY "plan_read_public"
ON "Plan"
FOR SELECT
TO anon, authenticated
USING (true);

-- Explicit full policies for service_role.
CREATE POLICY "service_role_all_user"
ON "User"
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "service_role_all_company"
ON "Company"
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "service_role_all_request"
ON "Request"
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "service_role_all_proposal"
ON "Proposal"
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "service_role_all_billing_event"
ON "BillingEvent"
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "service_role_all_password_reset_token"
ON "PasswordResetToken"
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "service_role_all_due_diligence_report"
ON "DueDiligenceReport"
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "service_role_all_plan"
ON "Plan"
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
