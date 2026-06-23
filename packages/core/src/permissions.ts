// Granular `resource:action` permissions. These are the single source of truth for what any
// role can do; roles (see roles.ts) are just named bundles of these. Kept as typed constants
// (not a DB table) so they're compile-checked and can never drift from the code that guards routes.

// Scoped to a single organization (the tenant). A grant only applies within that org's resources.
export const ORG_PERMISSIONS = [
  'org:read',
  'org:update',
  'org:delete',
  'org:branding',
  'org:billing',
  'member:read',
  'member:invite',
  'member:update_role',
  'member:remove',
  'event:read',
  'event:create',
  'event:update',
  'event:publish',
  'event:cancel',
  'event:delete',
  'ticket_type:manage',
  'inventory:read',
  'order:read',
  'order:refund',
  'order:comp',
  'promo:manage',
  'checkin:scan',
  'checkin:dashboard',
  'finance:read',
  'payout:manage',
  'loyalty:read',
  'loyalty:manage',
  'partner:read',
  'partner:manage',
  'analytics:read',
  'attendee:read',
  'attendee:export',
] as const;

// Platform-wide (the operator). Holders act across every org; guarded separately from org scope.
export const PLATFORM_PERMISSIONS = [
  'platform:org:read',
  'platform:org:suspend',
  'platform:org:delete',
  'platform:user:read',
  'platform:user:suspend',
  'platform:user:impersonate',
  'platform:fee:read',
  'platform:fee:configure',
  'platform:payout:read',
  'platform:dispute:manage',
  'platform:event:moderate',
  'platform:content:moderate',
  'platform:support:read',
  'platform:refund:assist',
  'platform:settings:manage',
  'platform:role:manage',
  'platform:audit:read',
] as const;

export type OrgPermission = (typeof ORG_PERMISSIONS)[number];
export type PlatformPermission = (typeof PLATFORM_PERMISSIONS)[number];
export type Permission = OrgPermission | PlatformPermission;

export type Scope = 'org' | 'platform';
