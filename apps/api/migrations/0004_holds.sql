-- reserved = held + sold; availability is capacity - reserved. The single counter is what the
-- atomic conditional UPDATE guards against, so two buyers can never oversell the last seat.
ALTER TABLE ticket_types ADD COLUMN IF NOT EXISTS reserved INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS ticket_holds (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hold_id        UUID NOT NULL,
  ticket_type_id UUID NOT NULL REFERENCES ticket_types(id) ON DELETE CASCADE,
  event_id       UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  quantity       INTEGER NOT NULL CHECK (quantity > 0),
  status         TEXT NOT NULL DEFAULT 'held',
  expires_at     TIMESTAMPTZ NOT NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ticket_holds_hold_idx ON ticket_holds(hold_id);
CREATE INDEX IF NOT EXISTS ticket_holds_sweep_idx ON ticket_holds(status, expires_at);
