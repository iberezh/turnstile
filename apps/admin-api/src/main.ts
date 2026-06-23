import { bootstrapSuperadmin } from './bootstrap.js';
import { config } from './config.js';
import { runAdminMigrations } from './db/migrate.js';
import { createAdminServer } from './server.js';

await runAdminMigrations();
await bootstrapSuperadmin();
const app = createAdminServer();
app.listen(config.ADMIN_PORT, () => {
  console.log(`admin-api listening on :${config.ADMIN_PORT}`);
});
