import type { Context, Next } from 'koa';
import { ADMIN_COOKIE } from './cookie.js';
import { type AdminSession, verifyAdminSession } from './tokens.js';

// Make the authenticated admin available (and typed) on ctx.state.
declare module 'koa' {
  interface DefaultState {
    admin?: AdminSession;
  }
}

export async function requireAdmin(ctx: Context, next: Next): Promise<void> {
  const token = ctx.cookies.get(ADMIN_COOKIE);
  if (!token) {
    ctx.status = 401;
    ctx.body = { error: 'unauthorized' };
    return;
  }
  try {
    ctx.state.admin = verifyAdminSession(token);
  } catch {
    ctx.status = 401;
    ctx.body = { error: 'unauthorized' };
    return;
  }
  await next();
}
