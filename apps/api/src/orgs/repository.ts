import type { Selectable } from 'kysely';
import { db } from '../db/client.js';
import type { OrganizationsTable } from '../db/schema.js';

export interface OrgRecord {
  id: string;
  slug: string;
  name: string;
  createdBy: string;
}
export interface MemberRecord {
  userId: string;
  email: string;
  name: string | null;
  role: string;
}

function toOrg(row: Selectable<OrganizationsTable>): OrgRecord {
  return { id: row.id, slug: row.slug, name: row.name, createdBy: row.created_by };
}

// Create the org and seed the creator as owner in one transaction — an org is never ownerless.
export async function createOrgWithOwner(
  input: { name: string; slug: string },
  ownerId: string,
): Promise<OrgRecord> {
  return db.transaction().execute(async (trx) => {
    const org = await trx
      .insertInto('organizations')
      .values({ name: input.name, slug: input.slug, created_by: ownerId })
      .returningAll()
      .executeTakeFirstOrThrow();
    await trx
      .insertInto('memberships')
      .values({ org_id: org.id, user_id: ownerId, role: 'owner' })
      .execute();
    return toOrg(org);
  });
}

export async function findOrgBySlug(slug: string): Promise<OrgRecord | undefined> {
  const row = await db
    .selectFrom('organizations')
    .selectAll()
    .where('slug', '=', slug)
    .executeTakeFirst();
  return row ? toOrg(row) : undefined;
}

export async function getOrgById(id: string): Promise<OrgRecord | undefined> {
  const row = await db
    .selectFrom('organizations')
    .selectAll()
    .where('id', '=', id)
    .executeTakeFirst();
  return row ? toOrg(row) : undefined;
}

export async function listOrgsForUser(
  userId: string,
): Promise<Array<OrgRecord & { role: string }>> {
  const rows = await db
    .selectFrom('memberships')
    .innerJoin('organizations', 'organizations.id', 'memberships.org_id')
    .select([
      'organizations.id as id',
      'organizations.slug as slug',
      'organizations.name as name',
      'organizations.created_by as createdBy',
      'memberships.role as role',
    ])
    .where('memberships.user_id', '=', userId)
    .execute();
  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    name: r.name,
    createdBy: r.createdBy,
    role: r.role,
  }));
}

export async function listMembers(orgId: string): Promise<MemberRecord[]> {
  const rows = await db
    .selectFrom('memberships')
    .innerJoin('users', 'users.id', 'memberships.user_id')
    .select([
      'users.id as userId',
      'users.email as email',
      'users.name as name',
      'memberships.role as role',
    ])
    .where('memberships.org_id', '=', orgId)
    .execute();
  return rows.map((r) => ({ userId: r.userId, email: r.email, name: r.name, role: r.role }));
}

export async function countOwners(orgId: string): Promise<number> {
  const row = await db
    .selectFrom('memberships')
    .select((eb) => eb.fn.countAll().as('n'))
    .where('org_id', '=', orgId)
    .where('role', '=', 'owner')
    .executeTakeFirst();
  return Number(row?.n ?? 0);
}

export async function addMembership(orgId: string, userId: string, role: string): Promise<void> {
  await db.insertInto('memberships').values({ org_id: orgId, user_id: userId, role }).execute();
}

export async function updateMembershipRole(
  orgId: string,
  userId: string,
  role: string,
): Promise<void> {
  await db
    .updateTable('memberships')
    .set({ role })
    .where('org_id', '=', orgId)
    .where('user_id', '=', userId)
    .execute();
}

export async function removeMembership(orgId: string, userId: string): Promise<void> {
  await db
    .deleteFrom('memberships')
    .where('org_id', '=', orgId)
    .where('user_id', '=', userId)
    .execute();
}
