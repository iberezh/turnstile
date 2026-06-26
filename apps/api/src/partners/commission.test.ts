import { describe, expect, it } from 'vitest';
import { commissionCents } from './commission.js';

describe('commissionCents', () => {
  it('takes basis points of net revenue, floored', () => {
    expect(commissionCents(10000, 500)).toBe(500); // 5%
    expect(commissionCents(2500, 1000)).toBe(250); // 10%
    expect(commissionCents(999, 1000)).toBe(99); // floored
  });
  it('is zero for zero bps or non-positive net', () => {
    expect(commissionCents(10000, 0)).toBe(0);
    expect(commissionCents(-500, 1000)).toBe(0);
  });
});
