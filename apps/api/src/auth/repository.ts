import type { Selectable } from 'kysely';
import { db } from '../db/client.js';
import type { UsersTable } from '../db/schema.js';

export interface UserRecord {
  id: string;
  email: string;
  passwordHash: string;
  name: string | null;
}

function toRecord(row: Selectable<UsersTable>): UserRecord {
  return { id: row.id, email: row.email, passwordHash: row.password_hash, name: row.name };
}

export async function createUser(
  email: string,
  passwordHash: string,
  name: string | null,
): Promise<UserRecord> {
  const row = await db
    .insertInto('users')
    .values({ email, password_hash: passwordHash, name })
    .returningAll()
    .executeTakeFirstOrThrow();
  return toRecord(row);
}

export async function findUserByEmail(email: string): Promise<UserRecord | undefined> {
  const row = await db
    .selectFrom('users')
    .selectAll()
    .where('email', '=', email)
    .executeTakeFirst();
  return row ? toRecord(row) : undefined;
}

export async function findUserById(id: string): Promise<UserRecord | undefined> {
  const row = await db.selectFrom('users').selectAll().where('id', '=', id).executeTakeFirst();
  return row ? toRecord(row) : undefined;
}
