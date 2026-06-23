import { runMigrations } from './migrate.js';

await runMigrations();
console.log('migrations up to date');
process.exit(0);
