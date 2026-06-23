import { readdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { sql } from 'kysely';
import { adminDb } from './admin-client.js';

const MIGRATIONS_DIR = fileURLToPath(new URL('../../migrations', import.meta.url));

// Forward-only SQL migrations for the ADMIN database (same simple runner as the app).
export async function runAdminMigrations(): Promise<void> {
  await sql`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      name TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `.execute(adminDb);

  const files = (await readdir(MIGRATIONS_DIR)).filter((f) => f.endsWith('.sql')).sort();
  const rows = await adminDb.selectFrom('schema_migrations').select('name').execute();
  const applied = new Set(rows.map((r) => r.name));

  for (const file of files) {
    if (applied.has(file)) continue;
    const ddl = await readFile(`${MIGRATIONS_DIR}/${file}`, 'utf8');
    await adminDb.transaction().execute(async (trx) => {
      await sql.raw(ddl).execute(trx);
      await trx.insertInto('schema_migrations').values({ name: file }).execute();
    });
    console.log(`migrated ${file}`);
  }
}
