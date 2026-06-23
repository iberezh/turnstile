import { describe, expect, it } from 'vitest';
import { computeDiscountCents, type PromoState, promoRedeemable } from './discount.js';

describe('computeDiscountCents', () => {
  it('applies a percent discount, floored to cents', () => {
    expect(computeDiscountCents(5000, 'percent', 10)).toBe(500);
    expect(computeDiscountCents(999, 'percent', 33)).toBe(329);
    expect(computeDiscountCents(5000, 'percent', 100)).toBe(5000);
  });
  it('applies a fixed discount, clamped to the total', () => {
    expect(computeDiscountCents(5000, 'fixed', 600)).toBe(600);
    expect(computeDiscountCents(5000, 'fixed', 9999)).toBe(5000);
  });
});

describe('promoRedeemable', () => {
  const base: PromoState = {
    active: true,
    startsAt: null,
    endsAt: null,
    maxRedemptions: null,
    redeemedCount: 0,
  };
  const now = 1_000_000_000_000;

  it('accepts an active, unbounded code', () => {
    expect(promoRedeemable(base, now)).toBe(true);
  });
  it('rejects inactive, out-of-window, or exhausted codes', () => {
    expect(promoRedeemable({ ...base, active: false }, now)).toBe(false);
    expect(promoRedeemable({ ...base, startsAt: new Date(now + 1000) }, now)).toBe(false);
    expect(promoRedeemable({ ...base, endsAt: new Date(now - 1000) }, now)).toBe(false);
    expect(promoRedeemable({ ...base, maxRedemptions: 5, redeemedCount: 5 }, now)).toBe(false);
  });
});
