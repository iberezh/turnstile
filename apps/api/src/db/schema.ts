import type { Generated } from 'kysely';

// Kysely database types — the single typed contract for every query, so raw SQL can't drift.
// Tables grow per phase; auth lands users first.

export interface UsersTable {
  id: Generated<string>;
  email: string;
  password_hash: string;
  name: string | null;
  created_at: Generated<Date>;
}

export interface SchemaMigrationsTable {
  name: string;
  applied_at: Generated<Date>;
}

export interface Database {
  users: UsersTable;
  schema_migrations: SchemaMigrationsTable;
}
