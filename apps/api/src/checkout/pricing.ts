import { pointsDiscount, pointsEarned } from '../loyalty/points.js';
import { getBalance } from '../loyalty/repository.js';
import { computeDiscountCents, promoRedeemable } from '../promos/discount.js';
import { findPromoByCode } from '../promos/repository.js';
import type { HeldHold } from './repository.js';

export interface PricedOrder {
  amountCents: number; // final amount to charge
  discountCents: number; // promo discount
  promoCodeId?: string | undefined;
  pointsRedeemed: number;
  pointsDiscountCents: number;
  pointsToEarn: number;
}
export type PricingResult = { ok: true; priced: PricedOrder } | { ok: false; error: string };

// Validate + price an order: apply a promo (if any), then a loyalty redemption (if any), both
// server-side. The caps are re-checked atomically at fulfilment; this is the pre-flight that
// produces the amount to charge and rejects an unusable code / overspend with a clear error.
export async function priceOrder(opts: {
  eventId: string;
  orgId: string;
  buyerEmail: string;
  hold: HeldHold;
  promoCode?: string | undefined;
  redeemPoints?: number | undefined;
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
  const afterPromo = opts.hold.amountCents - discountCents;

  let pointsRedeemed = 0;
  let pointsDiscountCents = 0;
  if (opts.redeemPoints && opts.redeemPoints > 0) {
    const { points, cents } = pointsDiscount(opts.redeemPoints, afterPromo);
    if ((await getBalance(opts.orgId, opts.buyerEmail)) < points) {
      return { ok: false, error: 'insufficient points' };
    }
    pointsRedeemed = points;
    pointsDiscountCents = cents;
  }

  const amountCents = afterPromo - pointsDiscountCents;
  return {
    ok: true,
    priced: {
      amountCents,
      discountCents,
      promoCodeId,
      pointsRedeemed,
      pointsDiscountCents,
      pointsToEarn: pointsEarned(amountCents),
    },
  };
}
