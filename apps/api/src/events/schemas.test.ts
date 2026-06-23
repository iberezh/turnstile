import { describe, expect, it } from 'vitest';
import { slugify } from './schemas.js';

describe('slugify', () => {
  it('lowercases and hyphenates', () => {
    expect(slugify('Summer Synth Fest 2026')).toBe('summer-synth-fest-2026');
  });

  it('strips punctuation and collapses separators', () => {
    expect(slugify('  Jazz @ the Pier!! ')).toBe('jazz-the-pier');
  });

  it('falls back when nothing usable remains', () => {
    expect(slugify('!!!')).toBe('event');
  });
});
