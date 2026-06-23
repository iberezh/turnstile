import cors from '@koa/cors';
import Router from '@koa/router';
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import { authRouter } from './auth/routes.js';
import { config } from './config.js';

const API_PREFIX = '/api/v1';

// Builds the Koa app. Feature routers mount under /api/v1 as modules land.
export function createServer(): Koa {
  const app = new Koa();
  app.use(cors({ origin: config.WEB_ORIGIN, credentials: true }));
  app.use(bodyParser());

  const root = new Router({ prefix: API_PREFIX });
  root.get('/health', (ctx) => {
    ctx.body = { status: 'ok' };
  });
  root.use(authRouter.routes(), authRouter.allowedMethods());

  app.use(root.routes()).use(root.allowedMethods());
  return app;
}
