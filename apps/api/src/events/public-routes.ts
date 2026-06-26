import Router from '@koa/router';
import { API_PREFIX } from '../http.js';
import { getPublishedEventBySlug, searchPublishedEvents } from './repository.js';
import { DiscoverySchema } from './schemas.js';
import { listTicketTypes } from './ticket-type-repository.js';

// Public, unauthenticated marketplace reads — the data source for the SSR event pages.
// Only published events are ever exposed here.
export const publicEventRouter = new Router({ prefix: API_PREFIX });

publicEventRouter.get('/events', async (ctx) => {
  const parsed = DiscoverySchema.safeParse(ctx.query);
  if (!parsed.success) {
    ctx.status = 400;
    ctx.body = { error: 'invalid query' };
    return;
  }
  ctx.body = await searchPublishedEvents(parsed.data);
});

publicEventRouter.get('/events/:slug', async (ctx) => {
  const slug = ctx.params.slug;
  if (!slug) {
    ctx.status = 400;
    return;
  }
  const event = await getPublishedEventBySlug(slug);
  if (!event) {
    ctx.status = 404;
    ctx.body = { error: 'not found' };
    return;
  }
  const ticketTypes = (await listTicketTypes(event.id)).map((t) => ({
    ...t,
    available: Math.max(t.capacity - t.reserved, 0),
  }));
  ctx.body = { event, ticketTypes };
});
