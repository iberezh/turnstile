import Router from '@koa/router';
import { requireAuth } from '../auth/middleware.js';
import { loadOwnedEvent } from '../events/guard.js';
import { API_PREFIX } from '../http.js';
import { requireOrgPermission } from '../rbac/middleware.js';
import { createPromo, findPromoByCode, listPromos, setPromoActive } from './repository.js';
import { CreatePromoSchema } from './schemas.js';

export const promoRouter = new Router({ prefix: `${API_PREFIX}/orgs` });

const BASE = '/:orgId/events/:eventId/promo-codes';

promoRouter.get(BASE, requireAuth, requireOrgPermission('promo:manage'), async (ctx) => {
  const { orgId, eventId } = ctx.params;
  if (!orgId || !eventId) {
    ctx.status = 400;
    return;
  }
  if (!(await loadOwnedEvent(orgId, eventId))) {
    ctx.status = 404;
    return;
  }
  ctx.body = await listPromos(eventId);
});

promoRouter.post(BASE, requireAuth, requireOrgPermission('promo:manage'), async (ctx) => {
  const { orgId, eventId } = ctx.params;
  if (!orgId || !eventId) {
    ctx.status = 400;
    return;
  }
  if (!(await loadOwnedEvent(orgId, eventId))) {
    ctx.status = 404;
    return;
  }
  const parsed = CreatePromoSchema.safeParse(ctx.request.body);
  if (!parsed.success) {
    ctx.status = 400;
    ctx.body = { error: 'invalid input' };
    return;
  }
  if (await findPromoByCode(eventId, parsed.data.code)) {
    ctx.status = 409;
    ctx.body = { error: 'code already exists for this event' };
    return;
  }
  ctx.status = 201;
  ctx.body = await createPromo(eventId, parsed.data);
});

promoRouter.post(
  `${BASE}/:promoId/deactivate`,
  requireAuth,
  requireOrgPermission('promo:manage'),
  async (ctx) => {
    const { orgId, eventId, promoId } = ctx.params;
    if (!orgId || !eventId || !promoId) {
      ctx.status = 400;
      return;
    }
    if (!(await loadOwnedEvent(orgId, eventId))) {
      ctx.status = 404;
      return;
    }
    if (!(await setPromoActive(eventId, promoId, false))) {
      ctx.status = 404;
      return;
    }
    ctx.body = { id: promoId, active: false };
  },
);
