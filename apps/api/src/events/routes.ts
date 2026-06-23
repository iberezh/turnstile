import { randomUUID } from 'node:crypto';
import Router from '@koa/router';
import { writeAudit } from '../audit/repository.js';
import { requireAuth } from '../auth/middleware.js';
import { API_PREFIX } from '../http.js';
import { requireOrgPermission } from '../rbac/middleware.js';
import { loadOwnedEvent } from './guard.js';
import { createEvent, listOrgEvents, setEventStatus, updateEvent } from './repository.js';
import { CreateEventSchema, slugify, UpdateEventSchema } from './schemas.js';
import { listTicketTypes } from './ticket-type-repository.js';

export const eventRouter = new Router({ prefix: `${API_PREFIX}/orgs` });

const suffix = (): string => randomUUID().replace(/-/g, '').slice(0, 6);

eventRouter.post(
  '/:orgId/events',
  requireAuth,
  requireOrgPermission('event:create'),
  async (ctx) => {
    const user = ctx.state.user;
    const orgId = ctx.params.orgId;
    if (!user || !orgId) {
      ctx.status = user ? 400 : 401;
      return;
    }
    const parsed = CreateEventSchema.safeParse(ctx.request.body);
    if (!parsed.success) {
      ctx.status = 400;
      ctx.body = { error: 'invalid input' };
      return;
    }
    const event = await createEvent({
      orgId,
      createdBy: user.id,
      slug: `${slugify(parsed.data.title)}-${suffix()}`,
      title: parsed.data.title,
      description: parsed.data.description,
      venueName: parsed.data.venueName,
      venueAddress: parsed.data.venueAddress,
      coverImageUrl: parsed.data.coverImageUrl,
      startsAt: parsed.data.startsAt,
      endsAt: parsed.data.endsAt,
      timezone: parsed.data.timezone ?? 'UTC',
    });
    await writeAudit({
      actorId: user.id,
      scope: 'org',
      orgId,
      action: 'event.create',
      target: event.id,
      after: { slug: event.slug },
    });
    ctx.status = 201;
    ctx.body = event;
  },
);

eventRouter.get('/:orgId/events', requireAuth, requireOrgPermission('event:read'), async (ctx) => {
  const orgId = ctx.params.orgId;
  if (!orgId) {
    ctx.status = 400;
    return;
  }
  ctx.body = await listOrgEvents(orgId);
});

eventRouter.get(
  '/:orgId/events/:eventId',
  requireAuth,
  requireOrgPermission('event:read'),
  async (ctx) => {
    const { orgId, eventId } = ctx.params;
    if (!orgId || !eventId) {
      ctx.status = 400;
      return;
    }
    const event = await loadOwnedEvent(orgId, eventId);
    if (!event) {
      ctx.status = 404;
      return;
    }
    ctx.body = event;
  },
);

eventRouter.patch(
  '/:orgId/events/:eventId',
  requireAuth,
  requireOrgPermission('event:update'),
  async (ctx) => {
    const { orgId, eventId } = ctx.params;
    if (!orgId || !eventId) {
      ctx.status = 400;
      return;
    }
    const parsed = UpdateEventSchema.safeParse(ctx.request.body);
    if (!parsed.success) {
      ctx.status = 400;
      ctx.body = { error: 'invalid input' };
      return;
    }
    const event = await loadOwnedEvent(orgId, eventId);
    if (!event) {
      ctx.status = 404;
      return;
    }
    await updateEvent(eventId, parsed.data);
    ctx.body = { id: eventId, updated: true };
  },
);

eventRouter.post(
  '/:orgId/events/:eventId/publish',
  requireAuth,
  requireOrgPermission('event:publish'),
  async (ctx) => {
    const user = ctx.state.user;
    const { orgId, eventId } = ctx.params;
    if (!user || !orgId || !eventId) {
      ctx.status = user ? 400 : 401;
      return;
    }
    const event = await loadOwnedEvent(orgId, eventId);
    if (!event) {
      ctx.status = 404;
      return;
    }
    // Can't sell an event with nothing to sell.
    if ((await listTicketTypes(eventId)).length === 0) {
      ctx.status = 400;
      ctx.body = { error: 'add a ticket type before publishing' };
      return;
    }
    await setEventStatus(eventId, 'published');
    await writeAudit({
      actorId: user.id,
      scope: 'org',
      orgId,
      action: 'event.publish',
      target: eventId,
      before: { status: event.status },
      after: { status: 'published' },
    });
    ctx.body = { id: eventId, status: 'published' };
  },
);

eventRouter.post(
  '/:orgId/events/:eventId/cancel',
  requireAuth,
  requireOrgPermission('event:cancel'),
  async (ctx) => {
    const user = ctx.state.user;
    const { orgId, eventId } = ctx.params;
    if (!user || !orgId || !eventId) {
      ctx.status = user ? 400 : 401;
      return;
    }
    const event = await loadOwnedEvent(orgId, eventId);
    if (!event) {
      ctx.status = 404;
      return;
    }
    await setEventStatus(eventId, 'cancelled');
    await writeAudit({
      actorId: user.id,
      scope: 'org',
      orgId,
      action: 'event.cancel',
      target: eventId,
      before: { status: event.status },
      after: { status: 'cancelled' },
    });
    ctx.body = { id: eventId, status: 'cancelled' };
  },
);
