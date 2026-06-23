import { ORG_PERMISSIONS, type OrgPermission, type PlatformPermission } from './permissions.js';

export type OrgRole = 'owner' | 'admin' | 'event_manager' | 'finance' | 'scanner' | 'viewer';
export type PlatformRole =
  | 'superadmin'
  | 'platform_admin'
  | 'finance_admin'
  | 'support'
  | 'trust_safety'
  | 'analyst';

// Org roles → their permission bundle. Owner gets everything; the rest are least-privilege
// slices (finance touches money, scanner only checks people in, viewer is read-only).
export const ORG_ROLE_PERMISSIONS: Record<OrgRole, readonly OrgPermission[]> = {
  owner: ORG_PERMISSIONS,
  admin: ORG_PERMISSIONS.filter((p) => p !== 'org:delete'),
  event_manager: [
    'org:read',
    'event:read',
    'event:create',
    'event:update',
    'event:publish',
    'event:cancel',
    'ticket_type:manage',
    'inventory:read',
    'order:read',
    'order:comp',
    'promo:manage',
    'checkin:scan',
    'checkin:dashboard',
    'analytics:read',
  ],
  finance: [
    'org:read',
    'event:read',
    'inventory:read',
    'order:read',
    'order:refund',
    'finance:read',
    'payout:manage',
    'partner:read',
    'analytics:read',
  ],
  scanner: ['checkin:scan', 'checkin:dashboard'],
  viewer: ['org:read', 'event:read', 'inventory:read', 'checkin:dashboard', 'analytics:read'],
};

// Platform roles → their permission bundle. Superadmin is full access; the rest enforce
// separation of duties (finance configures money, trust_safety moderates, support assists).
export const PLATFORM_ROLE_PERMISSIONS: Record<PlatformRole, readonly PlatformPermission[]> = {
  superadmin: [
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
  ],
  platform_admin: [
    'platform:org:read',
    'platform:org:suspend',
    'platform:org:delete',
    'platform:user:read',
    'platform:user:suspend',
    'platform:user:impersonate',
    'platform:fee:read',
    'platform:payout:read',
    'platform:event:moderate',
    'platform:content:moderate',
    'platform:support:read',
    'platform:refund:assist',
    'platform:settings:manage',
    'platform:audit:read',
  ],
  finance_admin: [
    'platform:org:read',
    'platform:user:read',
    'platform:fee:read',
    'platform:fee:configure',
    'platform:payout:read',
    'platform:dispute:manage',
    'platform:support:read',
    'platform:refund:assist',
    'platform:audit:read',
  ],
  support: [
    'platform:org:read',
    'platform:user:read',
    'platform:user:impersonate',
    'platform:support:read',
    'platform:refund:assist',
    'platform:payout:read',
    'platform:audit:read',
  ],
  trust_safety: [
    'platform:org:read',
    'platform:org:suspend',
    'platform:user:read',
    'platform:user:suspend',
    'platform:event:moderate',
    'platform:content:moderate',
    'platform:audit:read',
  ],
  analyst: [
    'platform:org:read',
    'platform:user:read',
    'platform:fee:read',
    'platform:payout:read',
    'platform:audit:read',
  ],
};
