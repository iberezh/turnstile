import type { Generated } from 'kysely';

// The admin database — lives in its own Postgres instance. Admin identities and the platform
// audit trail are here and ONLY here; the main app has no credentials to reach this.

export interface AdminUsersTable {
  id: Generated<string>;
  email: string;
  password_hash: string;
  totp_secret: string; // base32, for RFC 6238 TOTP MFA
  platform_role: string;
  created_at: Generated<Date>;
}

export interface AdminAuditLogTable {
  id: Generated<string>;
  actor_id: string;
  action: string;
  target_type: string;
  target_id: string;
  metadata: unknown | null; // jsonb
  at: Generated<Date>;
}

export interface SchemaMigrationsTable {
  name: string;
  applied_at: Generated<Date>;
}

export interface AdminDatabase {
  admin_users: AdminUsersTable;
  admin_audit_log: AdminAuditLogTable;
  schema_migrations: SchemaMigrationsTable;
}
