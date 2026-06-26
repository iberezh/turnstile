-- Link a purchase to an attendee account when the buyer is signed in (guest checkout leaves it
-- null). Attendees are just users, so this is a nullable FK to users — it powers the "My tickets"
-- wallet and order history.
ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS orders_user_idx ON orders(user_id);
