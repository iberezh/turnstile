import { describe, expect, it } from 'vitest';
import { signSession, verifySession } from './tokens.js';

describe('session tokens', () => {
  it('round-trips a session', () => {
    const token = signSession({ id: 'u1', email: 'a@b.dev' });
    expect(verifySession(token)).toEqual({ id: 'u1', email: 'a@b.dev' });
  });

  it('rejects a tampered token', () => {
    const token = signSession({ id: 'u1', email: 'a@b.dev' });
    expect(() => verifySession(`${token}x`)).toThrow();
  });

  it('rejects a non-token string', () => {
    expect(() => verifySession('not-a-jwt')).toThrow();
  });
});
