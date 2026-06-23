import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { config } from '../config.js';

const EXPIRES_IN = '7d';

const SessionSchema = z.object({ id: z.string(), email: z.string() });
export type SessionUser = z.infer<typeof SessionSchema>;

export function signSession(user: SessionUser): string {
  return jwt.sign(user, config.JWT_SECRET, { expiresIn: EXPIRES_IN });
}

// Throws on an invalid/expired/tampered token, or a payload that isn't a valid session.
export function verifySession(token: string): SessionUser {
  return SessionSchema.parse(jwt.verify(token, config.JWT_SECRET));
}
