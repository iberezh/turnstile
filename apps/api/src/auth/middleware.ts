import type { Context, Next } from 'koa';
import { AUTH_COOKIE } from './cookie.js';
import { type SessionUser, verifySession } from './tokens.js';

// Make the authenticated user available (and typed) on ctx.state across the app.
declare module 'koa' {
  interface DefaultState {
    user?: SessionUser;
  }
}

// preHandler: verify the session cookie and attach ctx.state.user; 401 otherwise.
export async function requireAuth(ctx: Context, next: Next): Promise<void> {
  const token = ctx.cookies.get(AUTH_COOKIE);
  if (!token) {
    ctx.status = 401;
    ctx.body = { error: 'unauthorized' };
    return;
  }
  try {
    ctx.state.user = verifySession(token);
  } catch {
    ctx.status = 401;
    ctx.body = { error: 'unauthorized' };
    return;
  }
  await next();
}
