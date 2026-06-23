import { runAdminMigrations } from './migrate.js';

await runAdminMigrations();
console.log('admin migrations up to date');
process.exit(0);
