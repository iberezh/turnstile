import type { OrgPermission, PlatformPermission } from './permissions.js';
import {
  ORG_ROLE_PERMISSIONS,
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
