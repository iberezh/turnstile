import { config } from './config.js';
import { runMigrations } from './db/migrate.js';
import { createServer } from './server.js';

await runMigrations();
const app = createServer();
app.listen(config.PORT, () => {
  console.log(`api listening on :${config.PORT}`);
});
