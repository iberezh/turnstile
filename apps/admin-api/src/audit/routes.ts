import Router from '@koa/router';
import { requireAdmin } from '../auth/middleware.js';
import { ADMIN_API_PREFIX } from '../http.js';
import { requirePlatformPermission } from '../rbac/middleware.js';
import { listAdminAudit } from './repository.js';

export const auditRouter = new Router({ prefix: `${ADMIN_API_PREFIX}/audit` });

auditRouter.get(
  '/',
  requireAdmin,
  requirePlatformPermission('platform:audit:read'),
  async (ctx) => {
    ctx.body = await listAdminAudit();
  },
);
