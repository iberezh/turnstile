import { pointsEarned } from '../loyalty/points.js';
import { computeDiscountCents, promoRedeemable } from '../promos/discount.js';
import { findPromoByCode } from '../promos/repository.js';
import type { HeldHold } from './repository.js';

export interface PricedOrder {
  amountCents: number; // final amount to charge
  discountCents: number; // promo discount
  promoCodeId?: string | undefined;
  pointsToEarn: number;
}
export type PricingResult = { ok: true; priced: PricedOrder } | { ok: false; error: string };

// Validate + price an order: apply a promo (if any) server-side. The cap is re-checked atomically
// at fulfilment; this is the pre-flight that produces the amount to charge and rejects an unusable
// code. Loyalty points are EARNED here but never REDEEMED: checkout is unauthenticated and keyed by
// a caller-supplied email, so redeeming would let anyone spend another email's points. Redemption
// is only available through the org-authorized adjust endpoint (loyalty:manage).
export async function priceOrder(opts: {
  eventId: string;
  hold: HeldHold;
  promoCode?: string | undefined;
}): Promise<PricingResult> {
  let discountCents = 0;
  let promoCodeId: string | undefined;
  if (opts.promoCode) {
    const promo = await findPromoByCode(opts.eventId, opts.promoCode);
    if (!promo || !promoRedeemable(promo, Date.now())) {
      return { ok: false, error: 'invalid promo code' };
    }
    discountCents = computeDiscountCents(
      opts.hold.amountCents,
      promo.discountType,
      promo.discountValue,
    );
    promoCodeId = promo.id;
  }

  const amountCents = opts.hold.amountCents - discountCents;
  return {
    ok: true,
    priced: { amountCents, discountCents, promoCodeId, pointsToEarn: pointsEarned(amountCents) },
  };
}
