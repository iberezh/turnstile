import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { config } from '../config.js';

// A ticket's QR encodes this signed token. Signing means a screenshot can't be forged into a
// valid ticket for another id, and check-in (P3) verifies the signature before any DB lookup.
const TICKET_TTL = '400d';
const TicketClaimSchema = z.object({ t: z.string(), e: z.string() });

export function signTicket(ticketId: string, eventId: string): string {
  return jwt.sign({ t: ticketId, e: eventId }, config.JWT_SECRET, { expiresIn: TICKET_TTL });
}

export interface TicketClaim {
  ticketId: string;
  eventId: string;
}

// Throws on an invalid/expired/tampered token.
export function verifyTicket(token: string): TicketClaim {
  const claim = TicketClaimSchema.parse(jwt.verify(token, config.JWT_SECRET));
  return { ticketId: claim.t, eventId: claim.e };
}
