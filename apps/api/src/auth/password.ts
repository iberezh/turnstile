import bcrypt from 'bcryptjs';

const ROUNDS = 10;

// Compared against on login when the email is unknown, so an attacker can't tell registered
// emails apart by response timing.
export const DUMMY_HASH = bcrypt.hashSync('turnstile-dummy-password', ROUNDS);

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, ROUNDS);
}

export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
