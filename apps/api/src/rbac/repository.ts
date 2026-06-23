import { ORG_ROLES, type OrgRole } from '@turnstile/core';
import { db } from '../db/client.js';

const isOrgRole = (value: string): value is OrgRole =>
  (ORG_ROLES as readonly string[]).includes(value);

// A user's role within one org (undefined = not a member). The role string is validated against
// the known set so an unexpected DB value can never widen access.
export async function getOrgRole(userId: string, orgId: string): Promise<OrgRole | undefined> {
  const row = await db
    .selectFrom('memberships')
    .select('role')
    .where('user_id', '=', userId)
    .where('org_id', '=', orgId)
    .executeTakeFirst();
  return row && isOrgRole(row.role) ? row.role : undefined;
}
