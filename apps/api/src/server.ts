import cors from '@koa/cors';
import Router from '@koa/router';
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import { authRouter } from './auth/routes.js';
import { config } from './config.js';
import { API_PREFIX } from './http.js';
import { memberRouter } from './orgs/member-routes.js';
import { orgRouter } from './orgs/routes.js';

const healthRouter = new Router({ prefix: API_PREFIX });
healthRouter.get('/health', (ctx) => {
  ctx.body = { status: 'ok' };
});

// Each feature router carries its full prefix and mounts directly on the app — flat and
// predictable, rather than relying on @koa/router's nested-prefix propagation.
const routers = [healthRouter, authRouter, orgRouter, memberRouter];

export function createServer(): Koa {
  const app = new Koa();
  app.use(cors({ origin: config.WEB_ORIGIN, credentials: true }));
  app.use(bodyParser());
  for (const router of routers) {
    app.use(router.routes()).use(router.allowedMethods());
  }
  return app;
}
