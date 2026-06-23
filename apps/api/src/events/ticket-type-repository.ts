import type { Selectable, Updateable } from 'kysely';
import { db } from '../db/client.js';
import type { TicketTypesTable } from '../db/schema.js';
import type { TicketTypeInput, UpdateTicketTypeInput } from './schemas.js';

export interface TicketTypeRecord {
  id: string;
  eventId: string;
  name: string;
  priceCents: number;
  currency: string;
  capacity: number;
  salesStart: Date | null;
  salesEnd: Date | null;
  position: number;
}

function toTicketType(row: Selectable<TicketTypesTable>): TicketTypeRecord {
  return {
    id: row.id,
    eventId: row.event_id,
    name: row.name,
    priceCents: row.price_cents,
    currency: row.currency,
    capacity: row.capacity,
    salesStart: row.sales_start,
    salesEnd: row.sales_end,
    position: row.position,
  };
}

export async function addTicketType(
  eventId: string,
  input: TicketTypeInput,
): Promise<TicketTypeRecord> {
  const row = await db
    .insertInto('ticket_types')
    .values({
      event_id: eventId,
      name: input.name,
      price_cents: input.priceCents,
      currency: input.currency ?? 'usd',
      capacity: input.capacity,
      sales_start: input.salesStart ?? null,
      sales_end: input.salesEnd ?? null,
      position: input.position ?? 0,
    })
    .returningAll()
    .executeTakeFirstOrThrow();
  return toTicketType(row);
}

export async function listTicketTypes(eventId: string): Promise<TicketTypeRecord[]> {
  const rows = await db
    .selectFrom('ticket_types')
    .selectAll()
    .where('event_id', '=', eventId)
    .orderBy('position', 'asc')
    .orderBy('created_at', 'asc')
    .execute();
  return rows.map(toTicketType);
}

export async function updateTicketType(id: string, patch: UpdateTicketTypeInput): Promise<void> {
  const set: Updateable<TicketTypesTable> = {};
  if (patch.name !== undefined) set.name = patch.name;
  if (patch.priceCents !== undefined) set.price_cents = patch.priceCents;
  if (patch.currency !== undefined) set.currency = patch.currency;
  if (patch.capacity !== undefined) set.capacity = patch.capacity;
  if (patch.salesStart !== undefined) set.sales_start = patch.salesStart;
  if (patch.salesEnd !== undefined) set.sales_end = patch.salesEnd;
  if (patch.position !== undefined) set.position = patch.position;
  await db.updateTable('ticket_types').set(set).where('id', '=', id).execute();
}

export async function deleteTicketType(id: string): Promise<void> {
  await db.deleteFrom('ticket_types').where('id', '=', id).execute();
}

// Resolve a ticket type to its event's org, for the resource-ownership (tenant) check.
export async function getTicketTypeOrg(
  id: string,
): Promise<{ eventId: string; orgId: string } | undefined> {
  const row = await db
    .selectFrom('ticket_types')
    .innerJoin('events', 'events.id', 'ticket_types.event_id')
    .select(['ticket_types.event_id as eventId', 'events.org_id as orgId'])
    .where('ticket_types.id', '=', id)
    .executeTakeFirst();
  return row ? { eventId: row.eventId, orgId: row.orgId } : undefined;
}
