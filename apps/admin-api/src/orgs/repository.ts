import { appDb } from '../db/app-client.js';

export interface AdminOrgRow {
  id: string;
  slug: string;
  name: string;
  suspended: boolean;
}

export async function listOrgs(): Promise<AdminOrgRow[]> {
  const rows = await appDb
    .selectFrom('organizations')
    .select(['id', 'slug', 'name', 'suspended_at'])
    .orderBy('created_at', 'desc')
    .execute();
  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    name: r.name,
    suspended: r.suspended_at !== null,
  }));
}

export async function getOrg(orgId: string): Promise<AdminOrgRow | undefined> {
  const r = await appDb
    .selectFrom('organizations')
    .select(['id', 'slug', 'name', 'suspended_at'])
    .where('id', '=', orgId)
    .executeTakeFirst();
  return r
    ? { id: r.id, slug: r.slug, name: r.name, suspended: r.suspended_at !== null }
    : undefined;
}

// Cross-plane write into the main app DB. Suspending hides the org's events from the marketplace
// and blocks its checkout; unsuspending clears the flag.
export async function setOrgSuspended(orgId: string, suspended: boolean): Promise<void> {
  await appDb
    .updateTable('organizations')
    .set({ suspended_at: suspended ? new Date() : null })
    .where('id', '=', orgId)
    .execute();
}
