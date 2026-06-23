import { ORG_ROLES, type OrgRole, PLATFORM_ROLES, type PlatformRole } from '@turnstile/core';
import { db } from '../db/client.js';

const isOrgRole = (value: string): value is OrgRole =>
  (ORG_ROLES as readonly string[]).includes(value);
const isPlatformRole = (value: string): value is PlatformRole =>
  (PLATFORM_ROLES as readonly string[]).includes(value);

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

export async function getPlatformRole(userId: string): Promise<PlatformRole | undefined> {
  const row = await db
    .selectFrom('platform_admins')
    .select('platform_role')
    .where('user_id', '=', userId)
    .executeTakeFirst();
  return row && isPlatformRole(row.platform_role) ? row.platform_role : undefined;
}
