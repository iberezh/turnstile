import type { Context } from 'koa';
import { config } from '../config.js';

// Distinct cookie name from the app session — admin and tenant sessions never collide.
export const ADMIN_COOKIE = 'ts_admin';
const MAX_AGE_MS = 12 * 60 * 60 * 1000;

const baseOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: config.NODE_ENV === 'production',
  path: '/',
} as const;

export function setAdminCookie(ctx: Context, token: string): void {
  ctx.cookies.set(ADMIN_COOKIE, token, { ...baseOptions, maxAge: MAX_AGE_MS });
}

export function clearAdminCookie(ctx: Context): void {
  ctx.cookies.set(ADMIN_COOKIE, null, baseOptions);
}
