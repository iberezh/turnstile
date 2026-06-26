// Loyalty economics, in one place. Earn 1 point per whole dollar paid; redeem 1 point = 1 cent.
export const EARN_POINTS_PER_DOLLAR = 1;
export const REDEEM_CENTS_PER_POINT = 1;

export function pointsEarned(amountCents: number): number {
  return Math.floor(amountCents / 100) * EARN_POINTS_PER_DOLLAR;
}

// Turn a requested point spend into the actual (points, cents) to apply, never exceeding what's
// left to pay. Returns whole points so a partial cent can't strand a fractional point.
export function pointsDiscount(
  requestedPoints: number,
  remainingCents: number,
): { points: number; cents: number } {
  const capped = Math.max(0, Math.min(requestedPoints * REDEEM_CENTS_PER_POINT, remainingCents));
  const points = Math.floor(capped / REDEEM_CENTS_PER_POINT);
  return { points, cents: points * REDEEM_CENTS_PER_POINT };
}
