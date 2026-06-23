import Router from '@koa/router';
import { writeAudit } from '../audit/repository.js';
import { requireAuth } from '../auth/middleware.js';
import { API_PREFIX } from '../http.js';
import { requireOrgPermission } from '../rbac/middleware.js';
import { createOrgWithOwner, findOrgBySlug, getOrgById, listOrgsForUser } from './repository.js';
import { CreateOrgSchema } from './schemas.js';

export const orgRouter = new Router({ prefix: `${API_PREFIX}/orgs` });

// Anyone authenticated can create an org and becomes its owner.
orgRouter.post('/', requireAuth, async (ctx) => {
  const user = ctx.state.user;
  if (!user) {
    ctx.status = 401;
    return;
  }
  const parsed = CreateOrgSchema.safeParse(ctx.request.body);
  if (!parsed.success) {
    ctx.status = 400;
    ctx.body = { error: 'invalid input' };
    return;
  }
  const slug = parsed.data.slug.toLowerCase();
  if (await findOrgBySlug(slug)) {
    ctx.status = 409;
    ctx.body = { error: 'slug already taken' };
    return;
  }
  const org = await createOrgWithOwner({ name: parsed.data.name, slug }, user.id);
  await writeAudit({
    actorId: user.id,
    scope: 'org',
    orgId: org.id,
    action: 'org.create',
    target: org.id,
    after: org,
  });
  ctx.status = 201;
  ctx.body = org;
});

// The orgs the caller belongs to (with their role in each).
orgRouter.get('/', requireAuth, async (ctx) => {
  const user = ctx.state.user;
  if (!user) {
    ctx.status = 401;
    return;
  }
  ctx.body = await listOrgsForUser(user.id);
});

orgRouter.get('/:orgId', requireAuth, requireOrgPermission('org:read'), async (ctx) => {
  const orgId = ctx.params.orgId;
  if (!orgId) {
    ctx.status = 400;
    return;
  }
  const org = await getOrgById(orgId);
  if (!org) {
    ctx.status = 404;
    return;
  }
  ctx.body = org;
});
