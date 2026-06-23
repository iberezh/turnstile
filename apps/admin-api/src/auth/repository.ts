import { PLATFORM_ROLES, type PlatformRole } from '@turnstile/core';
import type { Selectable } from 'kysely';
import { adminDb } from '../db/admin-client.js';
import type { AdminUsersTable } from '../db/admin-schema.js';

export interface AdminRecord {
  id: string;
  email: string;
  passwordHash: string;
  totpSecret: string;
  role: PlatformRole;
}

const isPlatformRole = (value: string): value is PlatformRole =>
  (PLATFORM_ROLES as readonly string[]).includes(value);

// A stored role outside the known catalog can never authorize anything — the admin is treated
// as not found rather than granted an unrecognized role.
function toRecord(row: Selectable<AdminUsersTable>): AdminRecord | undefined {
  if (!isPlatformRole(row.platform_role)) return undefined;
  return {
    id: row.id,
    email: row.email,
    passwordHash: row.password_hash,
    totpSecret: row.totp_secret,
    role: row.platform_role,
  };
}

export async function findAdminByEmail(email: string): Promise<AdminRecord | undefined> {
  const row = await adminDb
    .selectFrom('admin_users')
    .selectAll()
    .where('email', '=', email)
    .executeTakeFirst();
  return row ? toRecord(row) : undefined;
}

export async function findAdminById(id: string): Promise<AdminRecord | undefined> {
  const row = await adminDb
    .selectFrom('admin_users')
    .selectAll()
    .where('id', '=', id)
    .executeTakeFirst();
  return row ? toRecord(row) : undefined;
}

export async function countAdmins(): Promise<number> {
  const row = await adminDb
    .selectFrom('admin_users')
    .select((eb) => eb.fn.countAll<string>().as('n'))
    .executeTakeFirstOrThrow();
  return Number(row.n);
}

export async function createAdmin(
  email: string,
  passwordHash: string,
  totpSecret: string,
  role: PlatformRole,
): Promise<void> {
  await adminDb
    .insertInto('admin_users')
    .values({ email, password_hash: passwordHash, totp_secret: totpSecret, platform_role: role })
    .execute();
}
