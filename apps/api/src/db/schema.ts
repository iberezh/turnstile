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

export interface OrganizationsTable {
  id: Generated<string>;
  slug: string;
  name: string;
  created_by: string;
  created_at: Generated<Date>;
}

export interface MembershipsTable {
  id: Generated<string>;
  org_id: string;
  user_id: string;
  role: string;
  created_at: Generated<Date>;
}

export interface PlatformAdminsTable {
  user_id: string;
  platform_role: string;
  created_at: Generated<Date>;
}

export interface AuditLogTable {
  id: Generated<string>;
  actor_id: string | null;
  scope: string;
  org_id: string | null;
  action: string;
  target: string;
  before: unknown | null; // jsonb
  after: unknown | null; // jsonb
  at: Generated<Date>;
}

export interface EventsTable {
  id: Generated<string>;
  org_id: string;
  slug: string;
  title: string;
  description: string | null;
  venue_name: string | null;
  venue_address: string | null;
  cover_image_url: string | null;
  starts_at: Date;
  ends_at: Date | null;
  timezone: string;
  status: Generated<string>;
  created_by: string;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}

export interface TicketTypesTable {
  id: Generated<string>;
  event_id: string;
  name: string;
  price_cents: number;
  currency: string;
  capacity: number;
  reserved: Generated<number>;
  sales_start: Date | null;
  sales_end: Date | null;
  position: number;
  created_at: Generated<Date>;
}

export interface TicketHoldsTable {
  id: Generated<string>;
  hold_id: string;
  ticket_type_id: string;
  event_id: string;
  quantity: number;
  status: Generated<string>;
  expires_at: Date;
  created_at: Generated<Date>;
}

export interface SchemaMigrationsTable {
  name: string;
  applied_at: Generated<Date>;
}

export interface Database {
  users: UsersTable;
  organizations: OrganizationsTable;
  memberships: MembershipsTable;
  platform_admins: PlatformAdminsTable;
  audit_log: AuditLogTable;
  events: EventsTable;
  ticket_types: TicketTypesTable;
  ticket_holds: TicketHoldsTable;
  schema_migrations: SchemaMigrationsTable;
}
