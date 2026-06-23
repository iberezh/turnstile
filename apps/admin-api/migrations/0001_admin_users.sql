-- Admin identities live in the admin database only. password_hash + totp_secret back a
-- password + RFC 6238 TOTP (MFA) login; platform_role is validated against the shared catalog.
CREATE TABLE IF NOT EXISTS admin_users (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email          TEXT NOT NULL UNIQUE,
  password_hash  TEXT NOT NULL,
  totp_secret    TEXT NOT NULL,
  platform_role  TEXT NOT NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
