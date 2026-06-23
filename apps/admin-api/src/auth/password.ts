import bcrypt from 'bcryptjs';

const ROUNDS = 10;

// Compared against on login when the email is unknown, so timing can't reveal which admin
// emails exist.
export const DUMMY_HASH = bcrypt.hashSync('turnstile-admin-dummy', ROUNDS);

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, ROUNDS);
}

export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
