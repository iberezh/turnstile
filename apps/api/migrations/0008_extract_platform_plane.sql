-- The platform-admin (control) plane moves to a separate service backed by a separate database,
-- so its identities never live alongside tenant data. Drop the in-app admin table here; the
-- admin service owns admin_users in its own instance.
DROP TABLE IF EXISTS platform_admins;

-- Hooks that let the external control plane affect the running app:
--  - a suspended org disappears from the marketplace and can't take payments;
--  - a moderated-away event is hidden from public discovery.
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMPTZ;
ALTER TABLE events ADD COLUMN IF NOT EXISTS moderation_status TEXT NOT NULL DEFAULT 'ok';
ALTER TABLE events ADD COLUMN IF NOT EXISTS moderated_at TIMESTAMPTZ;
