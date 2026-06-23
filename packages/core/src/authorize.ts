import type { OrgPermission, PlatformPermission } from './permissions.js';
import {
  ORG_ROLE_PERMISSIONS,
  ORG_ROLE_RANK,
  type OrgRole,
  PLATFORM_ROLE_PERMISSIONS,
  type PlatformRole,
} from './roles.js';

// Pure permission checks. The API layer adds the tenant guard (does this resource belong to the
// scoped org?) on top — having the permission is necessary but not sufficient for cross-tenant data.
export function roleHasOrgPermission(role: OrgRole, permission: OrgPermission): boolean {
  return ORG_ROLE_PERMISSIONS[role].includes(permission);
}

export function roleHasPlatformPermission(
  role: PlatformRole,
  permission: PlatformPermission,
): boolean {
  return PLATFORM_ROLE_PERMISSIONS[role].includes(permission);
}

// Whether an actor with `actorRole` may grant or act on `otherRole` — only at or below their own
// rank. So an admin can't create or modify an owner, and only an owner can grant the owner role.
export function canManageOrgRole(actorRole: OrgRole, otherRole: OrgRole): boolean {
  return ORG_ROLE_RANK[actorRole] >= ORG_ROLE_RANK[otherRole];
}
