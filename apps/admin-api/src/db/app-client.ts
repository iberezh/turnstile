import { Kysely, PostgresDialect } from 'kysely';
import pg from 'pg';
import { config } from '../config.js';
import type { AppDatabase } from './app-schema.js';

// Connection to the MAIN app DB, used for cross-plane actions (suspend org, moderate event).
// These are the control plane's own elevated credentials — held only by this service.
const pool = new pg.Pool({ connectionString: config.APP_DATABASE_URL });

export const appDb = new Kysely<AppDatabase>({ dialect: new PostgresDialect({ pool }) });
