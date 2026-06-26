-- Loyalty is org-scoped and keyed by attendee email (attendees aren't platform accounts). The
-- ledger is the append-only source of truth; points_balance is a cached running total maintained
-- atomically alongside each ledger entry.
CREATE TABLE IF NOT EXISTS loyalty_accounts (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id         UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email          TEXT NOT NULL,
  points_balance INTEGER NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (org_id, email)
);

CREATE TABLE IF NOT EXISTS loyalty_ledger (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id     UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email      TEXT NOT NULL,
  order_id   UUID REFERENCES orders(id) ON DELETE SET NULL,
  delta      INTEGER NOT NULL,        -- + earn/credit, - redeem/debit
  reason     TEXT NOT NULL,           -- 'earn' | 'redeem' | 'adjust'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS loyalty_ledger_org_email_idx ON loyalty_ledger (org_id, email);

-- What a paid order earned / spent in points, for reconciliation.
ALTER TABLE orders ADD COLUMN IF NOT EXISTS points_earned INTEGER NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS points_redeemed INTEGER NOT NULL DEFAULT 0;
