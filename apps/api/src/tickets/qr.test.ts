import { describe, expect, it } from 'vitest';
import { signTicket, verifyTicket } from './qr.js';

describe('ticket QR tokens', () => {
  it('round-trips a ticket claim', () => {
    const token = signTicket('ticket-1', 'event-1');
    expect(verifyTicket(token)).toEqual({ ticketId: 'ticket-1', eventId: 'event-1' });
  });

  it('rejects a tampered token', () => {
    const token = signTicket('ticket-1', 'event-1');
    expect(() => verifyTicket(`${token}x`)).toThrow();
  });

  it('rejects a non-token string', () => {
    expect(() => verifyTicket('forged')).toThrow();
  });
});
