import { describe, expect, it } from 'vitest';
import { base32Decode, base32Encode, generateTotp, verifyTotp } from './totp.js';

// RFC 6238 Appendix B reference secret ("12345678901234567890") and its 6-digit codes.
const SECRET = 'GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ';

describe('totp', () => {
  it('round-trips base32 against the RFC seed', () => {
    expect(base32Decode(SECRET).toString('utf8')).toBe('12345678901234567890');
    expect(base32Encode(Buffer.from('12345678901234567890'))).toBe(SECRET);
  });

  it('matches RFC 6238 reference vectors (truncated to 6 digits)', () => {
    expect(generateTotp(SECRET, 59_000)).toBe('287082');
    expect(generateTotp(SECRET, 1_111_111_109_000)).toBe('081804');
    expect(generateTotp(SECRET, 1_111_111_111_000)).toBe('050471');
    expect(generateTotp(SECRET, 1_234_567_890_000)).toBe('005924');
  });

  it('verifies the current code and tolerates one step of skew', () => {
    const at = 1_234_567_890_000;
    expect(verifyTotp(SECRET, generateTotp(SECRET, at), at)).toBe(true);
    expect(verifyTotp(SECRET, generateTotp(SECRET, at - 30_000), at)).toBe(true);
    expect(verifyTotp(SECRET, '000000', at)).toBe(false);
  });
});
