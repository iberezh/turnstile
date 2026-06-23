import { readdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { sql } from 'kysely';
import { db } from './client.js';

const MIGRATIONS_DIR = fileURLToPath(new URL('../../migrations', import.meta.url));

// Forward-only SQL migrations: each *.sql file runs once, inside a transaction, and its name is
// recorded. Idempotent — re-running applies only what's pending. Kept deliberately simple.
export async function runMigrations(): Promise<void> {
  await sql`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      name TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `.execute(db);

  const files = (await readdir(MIGRATIONS_DIR)).filter((f) => f.endsWith('.sql')).sort();
  const rows = await db.selectFrom('schema_migrations').select('name').execute();
  const applied = new Set(rows.map((r) => r.name));

  for (const file of files) {
    if (applied.has(file)) continue;
    const ddl = await readFile(`${MIGRATIONS_DIR}/${file}`, 'utf8');
    await db.transaction().execute(async (trx) => {
      await sql.raw(ddl).execute(trx);
      await trx.insertInto('schema_migrations').values({ name: file }).execute();
    });
    console.log(`migrated ${file}`);
  }
}
