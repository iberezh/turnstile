import { describe, expect, it } from 'vitest';
import { pointsDiscount, pointsEarned } from './points.js';

describe('pointsEarned', () => {
  it('awards one point per whole dollar', () => {
    expect(pointsEarned(5000)).toBe(50);
    expect(pointsEarned(2599)).toBe(25);
    expect(pointsEarned(99)).toBe(0);
  });
});

describe('pointsDiscount', () => {
  it('redeems at 1 point = 1 cent', () => {
    expect(pointsDiscount(300, 5000)).toEqual({ points: 300, cents: 300 });
  });
  it('caps the spend at what is left to pay', () => {
    expect(pointsDiscount(9999, 1800)).toEqual({ points: 1800, cents: 1800 });
  });
  it('handles zero / negative remaining', () => {
    expect(pointsDiscount(500, 0)).toEqual({ points: 0, cents: 0 });
    expect(pointsDiscount(500, -10)).toEqual({ points: 0, cents: 0 });
  });
});
