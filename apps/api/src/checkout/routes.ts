import Router from '@koa/router';
import { AUTH_COOKIE } from '../auth/cookie.js';
import { verifySession } from '../auth/tokens.js';
import { getPublishedEventBySlug } from '../events/repository.js';
import { API_PREFIX } from '../http.js';
import { findActivePartner } from '../partners/repository.js';
import { getOrgConnect } from '../payments/connect-repository.js';
import { payments } from '../payments/index.js';
import { priceOrder } from './pricing.js';
import { fulfilOrder, loadHeldHold } from './repository.js';
import { CheckoutSchema } from './schemas.js';

const PLATFORM_TAKE_RATE = 0.05;

// Public checkout: exchange a hold for payment. In mock mode the intent auto-succeeds and we
// fulfil immediately; in live mode we return a client secret and a webhook fulfils on success.
export const checkoutRouter = new Router({ prefix: API_PREFIX });

checkoutRouter.post('/events/:slug/checkout', async (ctx) => {
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
  const parsed = CheckoutSchema.safeParse(ctx.request.body);
  if (!parsed.success) {
    ctx.status = 400;
    ctx.body = { error: 'invalid input' };
    return;
  }
  // The organizer must have completed Connect onboarding to take money.
  const connect = await getOrgConnect(event.orgId);
  if (!connect?.stripeAccountId || !connect.chargesEnabled) {
    ctx.status = 409;
    ctx.body = { error: 'organizer cannot accept payments yet' };
    return;
  }
  const hold = await loadHeldHold(parsed.data.holdId);
  if (!hold || hold.eventId !== event.id) {
    ctx.status = 409;
    ctx.body = { error: 'reservation expired or invalid' };
    return;
  }

  // Promo is priced server-side; its cap is re-checked atomically at fulfilment. A bad code is
  // rejected here before any charge.
  const pricing = await priceOrder({
    eventId: event.id,
    hold,
    promoCode: parsed.data.promoCode,
  });
  if (!pricing.ok) {
    ctx.status = 409;
    ctx.body = { error: pricing.error };
    return;
  }
  const { amountCents, discountCents, promoCodeId, pointsToEarn } = pricing.priced;

  // Optional referral attribution — best-effort: an unknown/inactive code simply isn't attributed.
  // It never changes the price or whether the order goes through (so a bad ref can't block a sale).
  const partner = parsed.data.ref
    ? await findActivePartner(event.orgId, parsed.data.ref)
    : undefined;

  // Optional auth: if the buyer is signed in, link the order to their account (for "My tickets").
  // Guest checkout is still allowed — an absent or invalid session just leaves it unlinked.
  let userId: string | undefined;
  const session = ctx.cookies.get(AUTH_COOKIE);
  if (session) {
    try {
      userId = verifySession(session).id;
    } catch {
      /* guest */
    }
  }

  const feeCents = Math.round(amountCents * PLATFORM_TAKE_RATE);
  const intent = await payments.createPaymentIntent({
    amountCents,
    currency: hold.currency,
    destinationAccountId: connect.stripeAccountId,
    applicationFeeCents: feeCents,
    metadata: { holdId: parsed.data.holdId, eventId: event.id },
  });

  if (intent.status !== 'succeeded') {
    ctx.body = {
      status: 'requires_payment',
      paymentIntentId: intent.id,
      clientSecret: intent.clientSecret,
      amountCents,
      discountCents,
      feeCents,
    };
    return;
  }

  const result = await fulfilOrder({
    holdId: parsed.data.holdId,
    eventId: event.id,
    orgId: event.orgId,
    buyerEmail: parsed.data.buyerEmail,
    paymentIntentId: intent.id,
    amountCents,
    feeCents,
    discountCents,
    promoCodeId,
    pointsEarned: pointsToEarn,
    partnerId: partner?.id,
    userId,
    currency: hold.currency,
    lines: hold.lines,
  });
  if (!result) {
    ctx.status = 409;
    ctx.body = { error: 'reservation no longer valid' };
    return;
  }
  ctx.status = 201;
  ctx.body = {
    status: 'paid',
    orderId: result.orderId,
    amountCents,
    discountCents,
    pointsEarned: pointsToEarn,
    feeCents,
    currency: hold.currency,
    tickets: result.ticketTokens,
  };
});
