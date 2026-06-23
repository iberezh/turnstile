import Router from '@koa/router';
import { getPublishedEventBySlug } from '../events/repository.js';
import { API_PREFIX } from '../http.js';
import { ReserveUnavailableError, releaseHold, reserve } from './repository.js';
import { ReserveSchema } from './schemas.js';

const HOLD_TTL_MS = 10 * 60 * 1000;

// Public: a cart reservation. No auth yet — the returned holdId is the capability the checkout
// step (P2c) will exchange for payment; an unpaid hold expires and frees its inventory.
export const reservationRouter = new Router({ prefix: API_PREFIX });

reservationRouter.post('/events/:slug/reserve', async (ctx) => {
  const slug = ctx.params.slug;
  if (!slug) {
    ctx.status = 400;
    return;
  }
  const event = await getPublishedEventBySlug(slug);
  if (!event) {
    ctx.status = 404;
    ctx.body = { error: 'event not found' };
    return;
  }
  const parsed = ReserveSchema.safeParse(ctx.request.body);
  if (!parsed.success) {
    ctx.status = 400;
    ctx.body = { error: 'invalid input' };
    return;
  }
  const expiresAt = new Date(Date.now() + HOLD_TTL_MS);
  try {
    const holdId = await reserve(event.id, parsed.data.items, expiresAt);
    ctx.status = 201;
    ctx.body = { holdId, expiresAt: expiresAt.toISOString(), items: parsed.data.items };
  } catch (err) {
    if (err instanceof ReserveUnavailableError) {
      ctx.status = 409;
      ctx.body = { error: 'not enough tickets available' };
      return;
    }
    throw err;
  }
});

reservationRouter.post('/reservations/:holdId/release', async (ctx) => {
  const holdId = ctx.params.holdId;
  if (!holdId) {
    ctx.status = 400;
    return;
  }
  await releaseHold(holdId);
  ctx.status = 204;
});
