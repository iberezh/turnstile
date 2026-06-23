import Router from '@koa/router';
import { requireAuth } from '../auth/middleware.js';
import { API_PREFIX } from '../http.js';
import { requireOrgPermission } from '../rbac/middleware.js';
import { loadOwnedEvent } from './guard.js';
import { TicketTypeSchema, UpdateTicketTypeSchema } from './schemas.js';
import {
  addTicketType,
  deleteTicketType,
  getTicketTypeOrg,
  listTicketTypes,
  updateTicketType,
} from './ticket-type-repository.js';

export const ticketTypeRouter = new Router({ prefix: `${API_PREFIX}/orgs` });

ticketTypeRouter.get(
  '/:orgId/events/:eventId/ticket-types',
  requireAuth,
  requireOrgPermission('event:read'),
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
    ctx.body = await listTicketTypes(eventId);
  },
);

ticketTypeRouter.post(
  '/:orgId/events/:eventId/ticket-types',
  requireAuth,
  requireOrgPermission('ticket_type:manage'),
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
    const parsed = TicketTypeSchema.safeParse(ctx.request.body);
    if (!parsed.success) {
      ctx.status = 400;
      ctx.body = { error: 'invalid input' };
      return;
    }
    ctx.status = 201;
    ctx.body = await addTicketType(eventId, parsed.data);
  },
);

ticketTypeRouter.patch(
  '/:orgId/events/:eventId/ticket-types/:ttId',
  requireAuth,
  requireOrgPermission('ticket_type:manage'),
  async (ctx) => {
    const { orgId, eventId, ttId } = ctx.params;
    if (!orgId || !eventId || !ttId) {
      ctx.status = 400;
      return;
    }
    const owner = await getTicketTypeOrg(ttId);
    if (!owner || owner.orgId !== orgId || owner.eventId !== eventId) {
      ctx.status = 404;
      return;
    }
    const parsed = UpdateTicketTypeSchema.safeParse(ctx.request.body);
    if (!parsed.success) {
      ctx.status = 400;
      ctx.body = { error: 'invalid input' };
      return;
    }
    await updateTicketType(ttId, parsed.data);
    ctx.body = { id: ttId, updated: true };
  },
);

ticketTypeRouter.delete(
  '/:orgId/events/:eventId/ticket-types/:ttId',
  requireAuth,
  requireOrgPermission('ticket_type:manage'),
  async (ctx) => {
    const { orgId, eventId, ttId } = ctx.params;
    if (!orgId || !eventId || !ttId) {
      ctx.status = 400;
      return;
    }
    const owner = await getTicketTypeOrg(ttId);
    if (!owner || owner.orgId !== orgId || owner.eventId !== eventId) {
      ctx.status = 404;
      return;
    }
    await deleteTicketType(ttId);
    ctx.status = 204;
  },
);
