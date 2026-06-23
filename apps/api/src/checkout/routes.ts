import Router from '@koa/router';
import { getPublishedEventBySlug } from '../events/repository.js';
import { API_PREFIX } from '../http.js';
import { getOrgConnect } from '../payments/connect-repository.js';
import { payments } from '../payments/index.js';
import { computeDiscountCents, promoRedeemable } from '../promos/discount.js';
import { findPromoByCode } from '../promos/repository.js';
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

  // Optional promo: priced server-side. The redemption cap is re-checked atomically at fulfilment;
  // this pre-flight validates the code and computes the discounted total + fee.
  let discountCents = 0;
  let promoCodeId: string | undefined;
  if (parsed.data.promoCode) {
    const promo = await findPromoByCode(event.id, parsed.data.promoCode);
    if (!promo || !promoRedeemable(promo, Date.now())) {
      ctx.status = 409;
      ctx.body = { error: 'invalid promo code' };
      return;
    }
    discountCents = computeDiscountCents(hold.amountCents, promo.discountType, promo.discountValue);
    promoCodeId = promo.id;
  }
  const amountCents = hold.amountCents - discountCents;

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
    feeCents,
    currency: hold.currency,
    tickets: result.ticketTokens,
  };
});
