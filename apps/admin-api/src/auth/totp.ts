import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

// RFC 6238 TOTP (SHA-1, 6 digits, 30s step) — compatible with standard authenticator apps.
// Self-contained on node:crypto: no third-party dependency for the second auth factor.
const STEP_SECONDS = 30;
const DIGITS = 6;
const B32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

export function base32Encode(buf: Buffer): string {
  let bits = 0;
  let value = 0;
  let out = '';
  for (const byte of buf) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      bits -= 5;
      out += B32.charAt((value >>> bits) & 0x1f);
    }
  }
  if (bits > 0) out += B32.charAt((value << (5 - bits)) & 0x1f);
  return out;
}

export function base32Decode(input: string): Buffer {
  let bits = 0;
  let value = 0;
  const out: number[] = [];
  for (const ch of input.toUpperCase()) {
    const idx = B32.indexOf(ch);
    if (idx === -1) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      bits -= 8;
      out.push((value >>> bits) & 0xff);
    }
  }
  return Buffer.from(out);
}

function hotp(key: Buffer, counter: number): string {
  const msg = Buffer.alloc(8);
  msg.writeBigUInt64BE(BigInt(counter));
  const hmac = createHmac('sha1', key).update(msg).digest();
  const offset = hmac.readUInt8(hmac.length - 1) & 0x0f;
  const bin = hmac.readUInt32BE(offset) & 0x7fffffff;
  return (bin % 10 ** DIGITS).toString().padStart(DIGITS, '0');
}

export function generateTotp(secretB32: string, atMs: number = Date.now()): string {
  return hotp(base32Decode(secretB32), Math.floor(atMs / 1000 / STEP_SECONDS));
}

// Accepts the current step plus one on each side to tolerate clock skew.
export function verifyTotp(secretB32: string, token: string, atMs: number = Date.now()): boolean {
  const key = base32Decode(secretB32);
  const counter = Math.floor(atMs / 1000 / STEP_SECONDS);
  for (const drift of [-1, 0, 1]) {
    const candidate = hotp(key, counter + drift);
    if (
      candidate.length === token.length &&
      timingSafeEqual(Buffer.from(candidate), Buffer.from(token))
    ) {
      return true;
    }
  }
  return false;
}

export function randomTotpSecret(): string {
  return base32Encode(randomBytes(20));
}

// otpauth:// URI an admin scans to enroll the secret in their authenticator app.
export function provisioningUri(label: string, issuer: string, secretB32: string): string {
  const params = new URLSearchParams({
    secret: secretB32,
    issuer,
    algorithm: 'SHA1',
    digits: String(DIGITS),
    period: String(STEP_SECONDS),
  });
  return `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(label)}?${params.toString()}`;
}
