import cors from '@koa/cors';
import Router from '@koa/router';
import Koa from 'koa';
import { config } from './config.js';

const API_PREFIX = '/api/v1';

// Builds the Koa app. Routes are mounted as the modules land (auth, orgs, events…); for now
// only health, so the foundation boots and CI has something to hit.
export function createServer(): Koa {
  const app = new Koa();
  app.use(cors({ origin: config.WEB_ORIGIN, credentials: true }));

  const router = new Router({ prefix: API_PREFIX });
  router.get('/health', (ctx) => {
    ctx.body = { status: 'ok' };
  });

  app.use(router.routes()).use(router.allowedMethods());
  return app;
}
