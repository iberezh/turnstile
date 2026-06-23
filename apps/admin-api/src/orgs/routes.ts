import Router from '@koa/router';
import { writeAdminAudit } from '../audit/repository.js';
import { requireAdmin } from '../auth/middleware.js';
import { ADMIN_API_PREFIX } from '../http.js';
import { requirePlatformPermission } from '../rbac/middleware.js';
import { getOrg, listOrgs, setOrgSuspended } from './repository.js';

export const adminOrgRouter = new Router({ prefix: `${ADMIN_API_PREFIX}/orgs` });

adminOrgRouter.get(
  '/',
  requireAdmin,
  requirePlatformPermission('platform:org:read'),
  async (ctx) => {
    ctx.body = await listOrgs();
  },
);

async function setSuspended(
  ctx: Parameters<Router.Middleware>[0],
  suspended: boolean,
): Promise<void> {
  const session = ctx.state.admin;
  const orgId = ctx.params.orgId;
  if (!session || !orgId) {
    ctx.status = session ? 400 : 401;
    return;
  }
  const org = await getOrg(orgId);
  if (!org) {
    ctx.status = 404;
    return;
  }
  await setOrgSuspended(orgId, suspended);
  await writeAdminAudit({
    actorId: session.id,
    action: suspended ? 'org.suspend' : 'org.unsuspend',
    targetType: 'organization',
    targetId: orgId,
  });
  ctx.body = { id: orgId, suspended };
}

adminOrgRouter.post(
  '/:orgId/suspend',
  requireAdmin,
  requirePlatformPermission('platform:org:suspend'),
  (ctx) => setSuspended(ctx, true),
);

adminOrgRouter.post(
  '/:orgId/unsuspend',
  requireAdmin,
  requirePlatformPermission('platform:org:suspend'),
  (ctx) => setSuspended(ctx, false),
);
