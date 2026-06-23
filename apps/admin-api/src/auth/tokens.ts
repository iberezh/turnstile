import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { config } from '../config.js';

// Short-lived, and signed with a SEPARATE secret + audience from the app session — a tenant
// cookie can never be replayed against the admin API. The role is NOT carried in the token;
// it's read fresh from the admin DB on every request so a revoked role takes effect immediately.
const EXPIRES_IN = '12h';
const AUDIENCE = 'turnstile-admin';

const AdminSessionSchema = z.object({ id: z.string(), email: z.string() });
export type AdminSession = z.infer<typeof AdminSessionSchema>;

export function signAdminSession(session: AdminSession): string {
  return jwt.sign(session, config.ADMIN_JWT_SECRET, { expiresIn: EXPIRES_IN, audience: AUDIENCE });
}

export function verifyAdminSession(token: string): AdminSession {
  return AdminSessionSchema.parse(
    jwt.verify(token, config.ADMIN_JWT_SECRET, { audience: AUDIENCE }),
  );
}
