import type { Generated } from 'kysely';

// A deliberately MINIMAL view of the main app database — only the columns the control plane
// reads or writes. The admin service connects to the app DB with its own credentials; this is
// not the app's full schema and isn't meant to be.

interface AppOrganizationsTable {
  id: Generated<string>;
  slug: string;
  name: string;
  suspended_at: Date | null;
  created_at: Generated<Date>;
}

interface AppEventsTable {
  id: Generated<string>;
  org_id: string;
  slug: string;
  title: string;
  status: Generated<string>;
  moderation_status: Generated<string>;
  moderated_at: Date | null;
}

export interface AppDatabase {
  organizations: AppOrganizationsTable;
  events: AppEventsTable;
}
