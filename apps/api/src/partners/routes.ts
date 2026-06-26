import Router from '@koa/router';
import { requireAuth } from '../auth/middleware.js';
import { API_PREFIX } from '../http.js';
import { requireOrgPermission } from '../rbac/middleware.js';
import {
  createPartner,
  findPartnerByCode,
  listPartnerStats,
  setPartnerActive,
} from './repository.js';
import { CreatePartnerSchema } from './schemas.js';

export const partnerRouter = new Router({ prefix: `${API_PREFIX}/orgs` });

partnerRouter.get(
  '/:orgId/partners',
  requireAuth,
  requireOrgPermission('partner:read'),
  async (ctx) => {
    const orgId = ctx.params.orgId;
    if (!orgId) {
      ctx.status = 400;
      return;
    }
    ctx.body = await listPartnerStats(orgId);
  },
);

partnerRouter.post(
  '/:orgId/partners',
  requireAuth,
  requireOrgPermission('partner:manage'),
  async (ctx) => {
    const orgId = ctx.params.orgId;
    if (!orgId) {
      ctx.status = 400;
      return;
    }
    const parsed = CreatePartnerSchema.safeParse(ctx.request.body);
    if (!parsed.success) {
      ctx.status = 400;
      ctx.body = { error: 'invalid input' };
      return;
    }
    if (await findPartnerByCode(orgId, parsed.data.code)) {
      ctx.status = 409;
      ctx.body = { error: 'code already exists for this org' };
      return;
    }
    ctx.status = 201;
    ctx.body = await createPartner(orgId, parsed.data);
  },
);

partnerRouter.post(
  '/:orgId/partners/:partnerId/deactivate',
  requireAuth,
  requireOrgPermission('partner:manage'),
  async (ctx) => {
    const { orgId, partnerId } = ctx.params;
    if (!orgId || !partnerId) {
      ctx.status = 400;
      return;
    }
    if (!(await setPartnerActive(orgId, partnerId, false))) {
      ctx.status = 404;
      return;
    }
    ctx.body = { id: partnerId, active: false };
  },
);
