import Router from '@koa/router';
import { API_PREFIX } from '../http.js';
import { getPublishedEventBySlug, listPublishedEvents } from './repository.js';
import { listTicketTypes } from './ticket-type-repository.js';

// Public, unauthenticated marketplace reads — the data source for the SSR event pages.
// Only published events are ever exposed here.
export const publicEventRouter = new Router({ prefix: API_PREFIX });

publicEventRouter.get('/events', async (ctx) => {
  ctx.body = await listPublishedEvents();
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
  ctx.body = { event, ticketTypes: await listTicketTypes(event.id) };
});
