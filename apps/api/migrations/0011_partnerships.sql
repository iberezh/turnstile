-- Affiliates / partners are org-scoped: a referral code works across all of the org's events and
-- attributes orders to a partner, who earns commission (basis points of attributed net revenue).
CREATE TABLE IF NOT EXISTS partners (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  code            TEXT NOT NULL,
  name            TEXT NOT NULL,
  commission_bps  INTEGER NOT NULL DEFAULT 0,  -- basis points (100 = 1%)
  active          BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (org_id, code)
);

-- Which partner referred a paid order (kept for attribution even if the partner is later removed).
ALTER TABLE orders ADD COLUMN IF NOT EXISTS partner_id UUID REFERENCES partners(id) ON DELETE SET NULL;
