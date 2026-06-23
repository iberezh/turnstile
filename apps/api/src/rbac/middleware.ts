import type Router from '@koa/router';
import {
  type OrgPermission,
  type PlatformPermission,
  roleHasOrgPermission,
  roleHasPlatformPermission,
} from '@turnstile/core';
import { getOrgRole, getPlatformRole } from './repository.js';

// Gate an org-scoped route. Runs after requireAuth. The :orgId path param is the tenant guard:
// the role is looked up for THIS user in THIS org, so a permission never leaks across tenants.
export function requireOrgPermission(permission: OrgPermission): Router.Middleware {
  return async (ctx, next) => {
    const user = ctx.state.user;
    if (!user) {
      ctx.status = 401;
      return;
    }
    const orgId = ctx.params.orgId;
    if (!orgId) {
      ctx.status = 400;
      return;
    }
    const role = await getOrgRole(user.id, orgId);
    if (!role || !roleHasOrgPermission(role, permission)) {
      ctx.status = 403;
      ctx.body = { error: 'forbidden' };
      return;
    }
    await next();
  };
}

export function requirePlatformPermission(permission: PlatformPermission): Router.Middleware {
  return async (ctx, next) => {
    const user = ctx.state.user;
    if (!user) {
      ctx.status = 401;
      return;
    }
    const role = await getPlatformRole(user.id);
    if (!role || !roleHasPlatformPermission(role, permission)) {
      ctx.status = 403;
      ctx.body = { error: 'forbidden' };
      return;
    }
    await next();
  };
}
