import Router from '@koa/router';
import { requireAuth } from '../auth/middleware.js';
import { API_PREFIX } from '../http.js';
import { listUserTickets } from './repository.js';

// Attendee-facing: the signed-in user's own tickets (the "My tickets" wallet).
export const accountRouter = new Router({ prefix: `${API_PREFIX}/me` });

accountRouter.get('/tickets', requireAuth, async (ctx) => {
  const user = ctx.state.user;
  if (!user) {
    ctx.status = 401;
    return;
  }
  ctx.body = await listUserTickets(user.id);
});
