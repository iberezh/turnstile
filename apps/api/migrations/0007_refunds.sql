-- Full-refund support: order.status -> 'refunded', its tickets -> 'refunded', and the seats are
-- returned to inventory (ticket_types.reserved decremented). refunded_at aids reconciliation.
ALTER TABLE orders ADD COLUMN IF NOT EXISTS refunded_at TIMESTAMPTZ;
