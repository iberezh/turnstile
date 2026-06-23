import Router from '@koa/router';
import { canManageOrgRole } from '@turnstile/core';
import { writeAudit } from '../audit/repository.js';
import { requireAuth } from '../auth/middleware.js';
import { findUserByEmail } from '../auth/repository.js';
import { API_PREFIX } from '../http.js';
import { requireOrgPermission } from '../rbac/middleware.js';
import { getOrgRole } from '../rbac/repository.js';
import {
  addMembership,
  countOwners,
  listMembers,
  removeMembership,
  updateMembershipRole,
} from './repository.js';
import { AddMemberSchema, UpdateRoleSchema } from './schemas.js';

export const memberRouter = new Router({ prefix: `${API_PREFIX}/orgs` });

memberRouter.get(
  '/:orgId/members',
  requireAuth,
  requireOrgPermission('member:read'),
  async (ctx) => {
    const orgId = ctx.params.orgId;
    if (!orgId) {
      ctx.status = 400;
      return;
    }
    ctx.body = await listMembers(orgId);
  },
);

// "Invite" = grant a role to an existing account by email (real email invites come later).
memberRouter.post(
  '/:orgId/members',
  requireAuth,
  requireOrgPermission('member:invite'),
  async (ctx) => {
    const actor = ctx.state.user;
    const orgId = ctx.params.orgId;
    if (!actor || !orgId) {
      ctx.status = actor ? 400 : 401;
      return;
    }
    const parsed = AddMemberSchema.safeParse(ctx.request.body);
    if (!parsed.success) {
      ctx.status = 400;
      ctx.body = { error: 'invalid input' };
      return;
    }
    const target = await findUserByEmail(parsed.data.email.toLowerCase());
    if (!target) {
      ctx.status = 404;
      ctx.body = { error: 'no account with that email' };
      return;
    }
    if (await getOrgRole(target.id, orgId)) {
      ctx.status = 409;
      ctx.body = { error: 'already a member' };
      return;
    }
    // Can't grant a role above your own (an admin can't mint an owner).
    const actorRole = await getOrgRole(actor.id, orgId);
    if (!actorRole || !canManageOrgRole(actorRole, parsed.data.role)) {
      ctx.status = 403;
      ctx.body = { error: 'cannot grant a role above your own' };
      return;
    }
    await addMembership(orgId, target.id, parsed.data.role);
    await writeAudit({
      actorId: actor.id,
      scope: 'org',
      orgId,
      action: 'member.add',
      target: target.id,
      after: { role: parsed.data.role },
    });
    ctx.status = 201;
    ctx.body = {
      userId: target.id,
      email: target.email,
      name: target.name,
      role: parsed.data.role,
    };
  },
);

memberRouter.patch(
  '/:orgId/members/:userId',
  requireAuth,
  requireOrgPermission('member:update_role'),
  async (ctx) => {
    const actor = ctx.state.user;
    const { orgId, userId } = ctx.params;
    if (!actor || !orgId || !userId) {
      ctx.status = actor ? 400 : 401;
      return;
    }
    const parsed = UpdateRoleSchema.safeParse(ctx.request.body);
    if (!parsed.success) {
      ctx.status = 400;
      ctx.body = { error: 'invalid input' };
      return;
    }
    const current = await getOrgRole(userId, orgId);
    if (!current) {
      ctx.status = 404;
      ctx.body = { error: 'not a member' };
      return;
    }
    // Can't modify a member ranked above you, nor promote anyone above your own rank.
    const actorRole = await getOrgRole(actor.id, orgId);
    if (
      !actorRole ||
      !canManageOrgRole(actorRole, current) ||
      !canManageOrgRole(actorRole, parsed.data.role)
    ) {
      ctx.status = 403;
      ctx.body = { error: 'cannot manage a role above your own' };
      return;
    }
    // An org must always keep at least one owner.
    if (current === 'owner' && parsed.data.role !== 'owner' && (await countOwners(orgId)) === 1) {
      ctx.status = 400;
      ctx.body = { error: 'org must keep an owner' };
      return;
    }
    await updateMembershipRole(orgId, userId, parsed.data.role);
    await writeAudit({
      actorId: actor.id,
      scope: 'org',
      orgId,
      action: 'member.update_role',
      target: userId,
      before: { role: current },
      after: { role: parsed.data.role },
    });
    ctx.body = { userId, role: parsed.data.role };
  },
);

memberRouter.delete(
  '/:orgId/members/:userId',
  requireAuth,
  requireOrgPermission('member:remove'),
  async (ctx) => {
    const actor = ctx.state.user;
    const { orgId, userId } = ctx.params;
    if (!actor || !orgId || !userId) {
      ctx.status = actor ? 400 : 401;
      return;
    }
    const current = await getOrgRole(userId, orgId);
    if (!current) {
      ctx.status = 404;
      ctx.body = { error: 'not a member' };
      return;
    }
    // Can't remove a member ranked above you (an admin can't remove an owner).
    const actorRole = await getOrgRole(actor.id, orgId);
    if (!actorRole || !canManageOrgRole(actorRole, current)) {
      ctx.status = 403;
      ctx.body = { error: 'cannot manage a role above your own' };
      return;
    }
    if (current === 'owner' && (await countOwners(orgId)) === 1) {
      ctx.status = 400;
      ctx.body = { error: 'org must keep an owner' };
      return;
    }
    await removeMembership(orgId, userId);
    await writeAudit({
      actorId: actor.id,
      scope: 'org',
      orgId,
      action: 'member.remove',
      target: userId,
      before: { role: current },
    });
    ctx.status = 204;
  },
);
