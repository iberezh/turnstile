-- Append-only platform action log. Separate from the app's org-scoped audit_log and unreachable
-- by the app's DB credentials, so the trail of admin actions can't be tampered from the app side.
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id     UUID NOT NULL,
  action       TEXT NOT NULL,
  target_type  TEXT NOT NULL,
  target_id    TEXT NOT NULL,
  metadata     JSONB,
  at           TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS admin_audit_log_at_idx ON admin_audit_log (at DESC);
