import type Router from '@koa/router';
import { type PlatformPermission, roleHasPlatformPermission } from '@turnstile/core';
import { findAdminById } from '../auth/repository.js';

// Platform RBAC, reusing the SAME permission/role catalog as the rest of the system. Runs after
// requireAdmin. The role is re-read from the admin DB here, so it always reflects current grants.
export function requirePlatformPermission(permission: PlatformPermission): Router.Middleware {
  return async (ctx, next) => {
    const session = ctx.state.admin;
    if (!session) {
      ctx.status = 401;
      return;
    }
    const admin = await findAdminById(session.id);
    if (!admin || !roleHasPlatformPermission(admin.role, permission)) {
      ctx.status = 403;
      ctx.body = { error: 'forbidden' };
      return;
    }
    await next();
  };
}
