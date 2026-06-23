import Router from '@koa/router';
import { requireAuth } from '../auth/middleware.js';
import { API_PREFIX } from '../http.js';
import { requireOrgPermission } from '../rbac/middleware.js';
import { orgFinance } from './repository.js';

export const financeRouter = new Router({ prefix: `${API_PREFIX}/orgs` });

// Reconciled statement for the org: per-currency totals plus a per-event breakdown.
financeRouter.get(
  '/:orgId/finance/summary',
  requireAuth,
  requireOrgPermission('finance:read'),
  async (ctx) => {
    const orgId = ctx.params.orgId;
    if (!orgId) {
      ctx.status = 400;
      return;
    }
    ctx.body = await orgFinance(orgId);
  },
);
