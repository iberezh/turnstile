CREATE TABLE IF NOT EXISTS orders (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id           UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  org_id             UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  hold_id            UUID NOT NULL,
  payment_intent_id  TEXT NOT NULL UNIQUE, -- idempotency: one fulfilment per payment
  buyer_email        TEXT NOT NULL,
  amount_cents       INTEGER NOT NULL,
  fee_cents          INTEGER NOT NULL, -- platform take-rate
  currency           TEXT NOT NULL,
  status             TEXT NOT NULL DEFAULT 'paid',
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS orders_event_idx ON orders(event_id);

CREATE TABLE IF NOT EXISTS tickets (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id       UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  event_id       UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  ticket_type_id UUID NOT NULL REFERENCES ticket_types(id) ON DELETE CASCADE,
  attendee_email TEXT NOT NULL,
  status         TEXT NOT NULL DEFAULT 'valid',
  scanned_at     TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS tickets_event_idx ON tickets(event_id);
CREATE INDEX IF NOT EXISTS tickets_order_idx ON tickets(order_id);
