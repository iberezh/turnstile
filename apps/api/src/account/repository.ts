import { db } from '../db/client.js';
import { signTicket } from '../tickets/qr.js';

export interface WalletTicket {
  id: string;
  eventTitle: string;
  eventSlug: string;
  startsAt: Date;
  timezone: string;
  status: string;
  token: string;
  orderId: string;
}

// Every ticket the signed-in user has bought (across all orders), with a freshly-signed QR token
// for display. Regenerating is fine — the token is just a signed claim of (ticketId, eventId), so a
// fresh one verifies at the door exactly like the original.
export async function listUserTickets(userId: string): Promise<WalletTicket[]> {
  const rows = await db
    .selectFrom('tickets as t')
    .innerJoin('orders as o', 'o.id', 't.order_id')
    .innerJoin('events as e', 'e.id', 't.event_id')
    .where('o.user_id', '=', userId)
    .orderBy('e.starts_at', 'asc')
    .select([
      't.id as id',
      't.event_id as eventId',
      't.status as status',
      'e.title as eventTitle',
      'e.slug as eventSlug',
      'e.starts_at as startsAt',
      'e.timezone as timezone',
      'o.id as orderId',
    ])
    .execute();
  return rows.map((r) => ({
    id: r.id,
    eventTitle: r.eventTitle,
    eventSlug: r.eventSlug,
    startsAt: r.startsAt,
    timezone: r.timezone,
    status: r.status,
    token: signTicket(r.id, r.eventId),
    orderId: r.orderId,
  }));
}
