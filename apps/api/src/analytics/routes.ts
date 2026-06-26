import Router from '@koa/router';
import { requireAuth } from '../auth/middleware.js';
import { loadOwnedEvent } from '../events/guard.js';
import { API_PREFIX } from '../http.js';
import { requireOrgPermission } from '../rbac/middleware.js';
import { getEventAnalytics } from './repository.js';

export const analyticsRouter = new Router({ prefix: `${API_PREFIX}/orgs` });

// Per-event operational analytics for the org dashboard: ticket issuance, door check-in rate,
// per-tier sales, and a daily sales time series.
analyticsRouter.get(
  '/:orgId/events/:eventId/analytics',
  requireAuth,
  requireOrgPermission('analytics:read'),
  async (ctx) => {
    const { orgId, eventId } = ctx.params;
    if (!orgId || !eventId) {
      ctx.status = 400;
      return;
    }
    if (!(await loadOwnedEvent(orgId, eventId))) {
      ctx.status = 404;
      return;
    }
    ctx.body = await getEventAnalytics(eventId);
  },
);
