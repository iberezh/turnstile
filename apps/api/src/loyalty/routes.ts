import Router from '@koa/router';
import { requireAuth } from '../auth/middleware.js';
import { db } from '../db/client.js';
import { API_PREFIX } from '../http.js';
import { requireOrgPermission } from '../rbac/middleware.js';
import { creditPoints, debitPoints, listAccounts, listLedger } from './repository.js';
import { AdjustPointsSchema } from './schemas.js';

export const loyaltyRouter = new Router({ prefix: `${API_PREFIX}/orgs` });

loyaltyRouter.get(
  '/:orgId/loyalty/accounts',
  requireAuth,
  requireOrgPermission('loyalty:read'),
  async (ctx) => {
    const orgId = ctx.params.orgId;
    if (!orgId) {
      ctx.status = 400;
      return;
    }
    ctx.body = await listAccounts(orgId);
  },
);

loyaltyRouter.get(
  '/:orgId/loyalty/ledger',
  requireAuth,
  requireOrgPermission('loyalty:read'),
  async (ctx) => {
    const orgId = ctx.params.orgId;
    const email = ctx.query.email;
    if (!orgId || typeof email !== 'string') {
      ctx.status = 400;
      return;
    }
    ctx.body = await listLedger(orgId, email.toLowerCase());
  },
);

loyaltyRouter.post(
  '/:orgId/loyalty/adjust',
  requireAuth,
  requireOrgPermission('loyalty:manage'),
  async (ctx) => {
    const orgId = ctx.params.orgId;
    if (!orgId) {
      ctx.status = 400;
      return;
    }
    const parsed = AdjustPointsSchema.safeParse(ctx.request.body);
    if (!parsed.success) {
      ctx.status = 400;
      ctx.body = { error: 'invalid input' };
      return;
    }
    const email = parsed.data.email.toLowerCase();
    const { delta, reason } = parsed.data;
    if (delta > 0) {
      await creditPoints(db, orgId, email, null, delta, reason);
    } else if (!(await debitPoints(db, orgId, email, null, -delta, reason))) {
      ctx.status = 409;
      ctx.body = { error: 'insufficient points' };
      return;
    }
    ctx.body = { email, delta };
  },
);
