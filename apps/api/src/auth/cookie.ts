import type { Context } from 'koa';
import { config } from '../config.js';

export const AUTH_COOKIE = 'ts_session';
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

// httpOnly so JS can't read it; SameSite=Lax works first-party; secure only off localhost.
const baseOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: config.NODE_ENV === 'production',
  path: '/',
} as const;

export function setSessionCookie(ctx: Context, token: string): void {
  ctx.cookies.set(AUTH_COOKIE, token, { ...baseOptions, maxAge: MAX_AGE_MS });
}

export function clearSessionCookie(ctx: Context): void {
  ctx.cookies.set(AUTH_COOKIE, null, baseOptions);
}
