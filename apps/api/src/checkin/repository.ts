import { db } from '../db/client.js';

export interface TicketState {
  status: string;
  scannedAt: Date | null;
}

// First-scan-wins: the conditional UPDATE only matches a still-valid ticket, so two simultaneous
// scans of the same ticket can't both admit — exactly one gets a row back.
export async function admitTicket(ticketId: string, eventId: string): Promise<Date | null> {
  const row = await db
    .updateTable('tickets')
    .set({ status: 'checked_in', scanned_at: new Date() })
    .where('id', '=', ticketId)
    .where('event_id', '=', eventId)
    .where('status', '=', 'valid')
    .returning('scanned_at')
    .executeTakeFirst();
  return row?.scanned_at ?? null;
}

// Read a ticket's current state (to explain why a scan was rejected).
export async function getTicketState(
  ticketId: string,
  eventId: string,
): Promise<TicketState | undefined> {
  const row = await db
    .selectFrom('tickets')
    .select(['status', 'scanned_at'])
    .where('id', '=', ticketId)
    .where('event_id', '=', eventId)
    .executeTakeFirst();
  return row ? { status: row.status, scannedAt: row.scanned_at } : undefined;
}

export interface CheckinStats {
  sold: number;
  checkedIn: number;
}

export async function checkinStats(eventId: string): Promise<CheckinStats> {
  const sold = await db
    .selectFrom('tickets')
    .select((eb) => eb.fn.countAll().as('n'))
    .where('event_id', '=', eventId)
    .executeTakeFirst();
  const checked = await db
    .selectFrom('tickets')
    .select((eb) => eb.fn.countAll().as('n'))
    .where('event_id', '=', eventId)
    .where('status', '=', 'checked_in')
    .executeTakeFirst();
  return { sold: Number(sold?.n ?? 0), checkedIn: Number(checked?.n ?? 0) };
}
