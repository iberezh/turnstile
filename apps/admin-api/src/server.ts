import cors from '@koa/cors';
import Router from '@koa/router';
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import { auditRouter } from './audit/routes.js';
import { adminAuthRouter } from './auth/routes.js';
import { config } from './config.js';
import { adminEventRouter } from './events/routes.js';
import { ADMIN_API_PREFIX } from './http.js';
import { adminOrgRouter } from './orgs/routes.js';

const healthRouter = new Router({ prefix: ADMIN_API_PREFIX });
healthRouter.get('/health', (ctx) => {
  ctx.body = { status: 'ok' };
});

const routers = [healthRouter, adminAuthRouter, adminOrgRouter, adminEventRouter, auditRouter];

export function createAdminServer(): Koa {
  const app = new Koa();
  app.use(cors({ origin: config.ADMIN_WEB_ORIGIN, credentials: true }));
  app.use(bodyParser());
  for (const router of routers) {
    app.use(router.routes()).use(router.allowedMethods());
  }
  return app;
}
