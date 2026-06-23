import type Router from '@koa/router';
import { type OrgPermission, roleHasOrgPermission } from '@turnstile/core';
import { getOrgRole } from './repository.js';

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
