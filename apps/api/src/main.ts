import { config } from './config.js';
import { createServer } from './server.js';

const app = createServer();
app.listen(config.PORT, () => {
  console.log(`api listening on :${config.PORT}`);
});
