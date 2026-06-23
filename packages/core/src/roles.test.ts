import { describe, expect, it } from 'vitest';
import { roleHasOrgPermission, roleHasPlatformPermission } from './authorize.js';
import { ORG_PERMISSIONS } from './permissions.js';
import { ORG_ROLE_PERMISSIONS } from './roles.js';

describe('org role bundles', () => {
  it('owner holds every org permission', () => {
    expect(ORG_ROLE_PERMISSIONS.owner.length).toBe(ORG_PERMISSIONS.length);
  });

  it('scanner can only check people in', () => {
    expect(roleHasOrgPermission('scanner', 'checkin:scan')).toBe(true);
    expect(roleHasOrgPermission('scanner', 'order:refund')).toBe(false);
    expect(roleHasOrgPermission('scanner', 'event:create')).toBe(false);
  });

  it('finance can refund and pay out but not edit events', () => {
    expect(roleHasOrgPermission('finance', 'order:refund')).toBe(true);
    expect(roleHasOrgPermission('finance', 'payout:manage')).toBe(true);
    expect(roleHasOrgPermission('finance', 'event:update')).toBe(false);
  });

  it('only the owner can delete the org', () => {
    expect(roleHasOrgPermission('owner', 'org:delete')).toBe(true);
    expect(roleHasOrgPermission('admin', 'org:delete')).toBe(false);
  });
});

describe('platform role bundles', () => {
  it('only superadmin manages admin roles', () => {
    expect(roleHasPlatformPermission('superadmin', 'platform:role:manage')).toBe(true);
    expect(roleHasPlatformPermission('platform_admin', 'platform:role:manage')).toBe(false);
  });

  it('separation of duties: only finance configures the take-rate', () => {
    expect(roleHasPlatformPermission('finance_admin', 'platform:fee:configure')).toBe(true);
    expect(roleHasPlatformPermission('trust_safety', 'platform:fee:configure')).toBe(false);
  });
});
