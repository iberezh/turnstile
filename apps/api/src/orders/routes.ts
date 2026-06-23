import Router from '@koa/router';
import { writeAudit } from '../audit/repository.js';
import { requireAuth } from '../auth/middleware.js';
import { loadOwnedEvent } from '../events/guard.js';
import { API_PREFIX } from '../http.js';
import { payments } from '../payments/index.js';
import { requireOrgPermission } from '../rbac/middleware.js';
import { getOrder, listOrders, refundOrder } from './repository.js';

export const orderRouter = new Router({ prefix: `${API_PREFIX}/orgs` });

// Sales ledger for an event — every order with its take-rate fee, newest first.
orderRouter.get(
  '/:orgId/events/:eventId/orders',
  requireAuth,
  requireOrgPermission('order:read'),
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
    ctx.body = await listOrders(eventId);
  },
);

// Full refund: reverse the charge at the provider first, then void the order and return its
// seats. Idempotent — a second attempt on an already-refunded order is a 409, not a double payout.
orderRouter.post(
  '/:orgId/events/:eventId/orders/:orderId/refund',
  requireAuth,
  requireOrgPermission('order:refund'),
  async (ctx) => {
    const user = ctx.state.user;
    const { orgId, eventId, orderId } = ctx.params;
    if (!user || !orgId || !eventId || !orderId) {
      ctx.status = user ? 400 : 401;
      return;
    }
    if (!(await loadOwnedEvent(orgId, eventId))) {
      ctx.status = 404;
      return;
    }
    const order = await getOrder(orderId);
    if (!order || order.orgId !== orgId || order.eventId !== eventId) {
      ctx.status = 404;
      return;
    }
    if (order.status !== 'paid') {
      ctx.status = 409;
      ctx.body = { error: 'order is not refundable' };
      return;
    }
    await payments.refund(order.paymentIntentId);
    const refunded = await refundOrder(orderId);
    if (!refunded) {
      // Lost a race with a concurrent refund; the charge reversal above is idempotent at Stripe.
      ctx.status = 409;
      ctx.body = { error: 'order is not refundable' };
      return;
    }
    await writeAudit({
      actorId: user.id,
      scope: 'org',
      orgId,
      action: 'order.refund',
      target: orderId,
      before: { status: 'paid' },
      after: { status: 'refunded', amountCents: order.amountCents, feeCents: order.feeCents },
    });
    ctx.body = {
      id: orderId,
      status: 'refunded',
      refundedAmountCents: order.amountCents,
      refundedFeeCents: order.feeCents,
    };
  },
);
