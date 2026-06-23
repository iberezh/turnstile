import { Kysely, PostgresDialect } from 'kysely';
import pg from 'pg';
import { config } from '../config.js';
import type { Database } from './schema.js';

const pool = new pg.Pool({ connectionString: config.DATABASE_URL });

export const db = new Kysely<Database>({ dialect: new PostgresDialect({ pool }) });
