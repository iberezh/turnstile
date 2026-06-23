-- Stripe Connect account per org. charges_enabled gates whether the org can actually sell
-- (set true once Stripe onboarding/KYC completes; cached here, refreshed from the API on status).
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS stripe_account_id TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS charges_enabled BOOLEAN NOT NULL DEFAULT false;
