import { randomUUID } from 'node:crypto';
import { type SqlBool, sql } from 'kysely';
import { db } from '../db/client.js';
import type { ReserveInput } from './schemas.js';

// Thrown (to roll the transaction back) when a line can't be reserved against available capacity.
export class ReserveUnavailableError extends Error {}

// Atomic, oversell-proof reservation. Each line does a single conditional UPDATE:
//   reserved = reserved + qty  WHERE id=? AND event_id=? AND reserved + qty <= capacity
// Postgres evaluates the guard and the increment as one row-locked operation, so two concurrent
// buyers can never both take the last seat — the loser's UPDATE matches 0 rows and we abort.
export async function reserve(
  eventId: string,
  items: ReserveInput['items'],
  expiresAt: Date,
): Promise<string> {
  const holdId = randomUUID();
  await db.transaction().execute(async (trx) => {
    for (const item of items) {
      const res = await trx
        .updateTable('ticket_types')
        .set({ reserved: sql<number>`reserved + ${item.quantity}` })
        .where('id', '=', item.ticketTypeId)
        .where('event_id', '=', eventId)
        .where(sql<SqlBool>`reserved + ${item.quantity} <= capacity`)
        .executeTakeFirst();
      if (res.numUpdatedRows === 0n) throw new ReserveUnavailableError();
      await trx
        .insertInto('ticket_holds')
        .values({
          hold_id: holdId,
          ticket_type_id: item.ticketTypeId,
          event_id: eventId,
          quantity: item.quantity,
          expires_at: expiresAt,
        })
        .execute();
    }
  });
  return holdId;
}

// Release a hold's inventory back. Idempotent: only acts on lines still 'held', and locks them
// first so a concurrent sweep can't double-decrement.
export async function releaseHold(holdId: string): Promise<void> {
  await db.transaction().execute(async (trx) => {
    const lines = await trx
      .selectFrom('ticket_holds')
      .select(['ticket_type_id', 'quantity'])
      .where('hold_id', '=', holdId)
      .where('status', '=', 'held')
      .forUpdate()
      .execute();
    for (const line of lines) {
      await trx
        .updateTable('ticket_types')
        .set({ reserved: sql<number>`greatest(reserved - ${line.quantity}, 0)` })
        .where('id', '=', line.ticket_type_id)
        .execute();
    }
    await trx
      .updateTable('ticket_holds')
      .set({ status: 'released' })
      .where('hold_id', '=', holdId)
      .where('status', '=', 'held')
      .execute();
  });
}

// Reclaim inventory from holds whose TTL has passed. Returns how many lines were swept.
export async function sweepExpiredHolds(now: Date): Promise<number> {
  return db.transaction().execute(async (trx) => {
    const lines = await trx
      .selectFrom('ticket_holds')
      .select(['id', 'ticket_type_id', 'quantity'])
      .where('status', '=', 'held')
      .where('expires_at', '<', now)
      .forUpdate()
      .execute();
    for (const line of lines) {
      await trx
        .updateTable('ticket_types')
        .set({ reserved: sql<number>`greatest(reserved - ${line.quantity}, 0)` })
        .where('id', '=', line.ticket_type_id)
        .execute();
      await trx
        .updateTable('ticket_holds')
        .set({ status: 'expired' })
        .where('id', '=', line.id)
        .execute();
    }
    return lines.length;
  });
}
