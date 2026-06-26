import { sql } from 'kysely';
import { db } from '../db/client.js';

export interface TierBreakdown {
  ticketTypeId: string;
  name: string;
  capacity: number;
  reserved: number;
  sold: number;
}
export interface SalesDay {
  day: string; // YYYY-MM-DD
  orders: number;
  grossCents: number;
}
export interface EventAnalytics {
  ticketsIssued: number;
  ticketsCheckedIn: number;
  checkinRate: number; // 0..1
  byTicketType: TierBreakdown[];
  salesByDay: SalesDay[];
}

const n = (v: string | number | bigint | null): number => (v === null ? 0 : Number(v));

export async function getEventAnalytics(eventId: string): Promise<EventAnalytics> {
  // Ticket totals: issued = anything not refunded; checked-in = admitted at the door.
  const totals = await db
    .selectFrom('tickets')
    .where('event_id', '=', eventId)
    .select((eb) => [
      eb.fn.count<string>('id').filterWhere('status', '<>', 'refunded').as('issued'),
      eb.fn.count<string>('id').filterWhere('status', '=', 'checked_in').as('checkedIn'),
    ])
    .executeTakeFirstOrThrow();
  const ticketsIssued = n(totals.issued);
  const ticketsCheckedIn = n(totals.checkedIn);

  // Per-tier sold counts. LEFT JOIN (with the refund filter in the join) keeps tiers with zero sales.
  const tiers = await db
    .selectFrom('ticket_types as tt')
    .leftJoin('tickets as t', (j) =>
      j.onRef('t.ticket_type_id', '=', 'tt.id').on('t.status', '<>', 'refunded'),
    )
    .where('tt.event_id', '=', eventId)
    .groupBy(['tt.id', 'tt.name', 'tt.capacity', 'tt.reserved', 'tt.position'])
    .orderBy('tt.position')
    .select((eb) => [
      'tt.id as ticketTypeId',
      'tt.name as name',
      'tt.capacity as capacity',
      'tt.reserved as reserved',
      eb.fn.count<string>('t.id').as('sold'),
    ])
    .execute();

  // Daily paid-order sales (a time series for the dashboard sparkline).
  const days = await db
    .selectFrom('orders')
    .where('event_id', '=', eventId)
    .where('status', '=', 'paid')
    .select((eb) => [
      sql<string>`to_char(date_trunc('day', created_at), 'YYYY-MM-DD')`.as('day'),
      eb.fn.countAll<string>().as('orders'),
      eb.fn.sum<string | null>('amount_cents').as('grossCents'),
    ])
    .groupBy(sql`date_trunc('day', created_at)`)
    .orderBy(sql`date_trunc('day', created_at)`)
    .execute();

  return {
    ticketsIssued,
    ticketsCheckedIn,
    checkinRate: ticketsIssued > 0 ? ticketsCheckedIn / ticketsIssued : 0,
    byTicketType: tiers.map((r) => ({
      ticketTypeId: r.ticketTypeId,
      name: r.name,
      capacity: r.capacity,
      reserved: r.reserved,
      sold: n(r.sold),
    })),
    salesByDay: days.map((r) => ({ day: r.day, orders: n(r.orders), grossCents: n(r.grossCents) })),
  };
}
