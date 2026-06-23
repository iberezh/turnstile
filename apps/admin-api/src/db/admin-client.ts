import { Kysely, PostgresDialect } from 'kysely';
import pg from 'pg';
import { config } from '../config.js';
import type { AdminDatabase } from './admin-schema.js';

const pool = new pg.Pool({ connectionString: config.ADMIN_DATABASE_URL });

export const adminDb = new Kysely<AdminDatabase>({ dialect: new PostgresDialect({ pool }) });
