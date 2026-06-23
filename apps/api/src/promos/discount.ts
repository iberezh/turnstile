export type DiscountType = 'percent' | 'fixed';

// Never discounts below zero or beyond the order total (a fixed code larger than the cart just
// zeroes it). Percent is floored to whole cents.
export function computeDiscountCents(
  amountCents: number,
  type: DiscountType,
  value: number,
): number {
  const raw = type === 'percent' ? Math.floor((amountCents * value) / 100) : value;
  return Math.max(0, Math.min(raw, amountCents));
}

export interface PromoState {
  active: boolean;
  startsAt: Date | null;
  endsAt: Date | null;
  maxRedemptions: number | null;
  redeemedCount: number;
}

// A code is redeemable when active, within its (optional) window, and under its (optional) cap.
// The cap is re-checked atomically at fulfilment; this is the pre-flight check for UX + pricing.
export function promoRedeemable(p: PromoState, atMs: number): boolean {
  if (!p.active) return false;
  if (p.startsAt && atMs < p.startsAt.getTime()) return false;
  if (p.endsAt && atMs > p.endsAt.getTime()) return false;
  if (p.maxRedemptions !== null && p.redeemedCount >= p.maxRedemptions) return false;
  return true;
}
