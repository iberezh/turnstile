-- Promo codes: per-event discounts applied at checkout. redeemed_count is incremented atomically
-- under the same conditional-update guard as ticket inventory, so a capped code can't oversell.
CREATE TABLE IF NOT EXISTS promo_codes (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id         UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  code             TEXT NOT NULL,
  discount_type    TEXT NOT NULL,           -- 'percent' | 'fixed'
  discount_value   INTEGER NOT NULL,        -- percent 1..100, or fixed amount in cents
  max_redemptions  INTEGER,                 -- NULL = unlimited
  redeemed_count   INTEGER NOT NULL DEFAULT 0,
  starts_at        TIMESTAMPTZ,
  ends_at          TIMESTAMPTZ,
  active           BOOLEAN NOT NULL DEFAULT true,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (event_id, code)
);

-- What a paid order actually carries: the discount applied and which code (kept for reconciliation
-- even if the code is later deleted).
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_cents INTEGER NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS promo_code_id UUID REFERENCES promo_codes(id) ON DELETE SET NULL;
