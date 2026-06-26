import { describe, expect, it } from 'vitest';
import { cellFor, haversineKm, nearbyCells } from './geo.js';

describe('event geo', () => {
  it('assigns the same H3 cell to nearby points and different cells to far ones', () => {
    const manhattan = cellFor(40.7128, -74.006);
    const nearby = cellFor(40.715, -74.004); // a few hundred metres away
    const la = cellFor(34.0522, -118.2437);
    expect(manhattan).toBe(nearby);
    expect(manhattan).not.toBe(la);
  });

  it('measures great-circle distance: ~0 for a point and ~3,900 km NYC→LA', () => {
    expect(haversineKm(40.7128, -74.006, 40.7128, -74.006)).toBeCloseTo(0, 5);
    const nycToLa = haversineKm(40.7128, -74.006, 34.0522, -118.2437);
    expect(nycToLa).toBeGreaterThan(3800);
    expect(nycToLa).toBeLessThan(4000);
  });

  it('includes the origin cell in its k-ring neighborhood', () => {
    expect(nearbyCells(40.7128, -74.006, 3)).toContain(cellFor(40.7128, -74.006));
  });
});
