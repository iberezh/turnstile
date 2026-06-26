import type { Selectable, Updateable } from 'kysely';
import { db } from '../db/client.js';
import type { EventsTable } from '../db/schema.js';
import { cellFor } from './geo.js';
import type { EventStatus, UpdateEventInput } from './schemas.js';

export interface EventRecord {
  id: string;
  orgId: string;
  slug: string;
  title: string;
  description: string | null;
  venueName: string | null;
  venueAddress: string | null;
  coverImageUrl: string | null;
  startsAt: Date;
  endsAt: Date | null;
  timezone: string;
  lat: number | null;
  lng: number | null;
  status: string;
  createdBy: string;
}

export interface NewEvent {
  orgId: string;
  createdBy: string;
  slug: string;
  title: string;
  description?: string | undefined;
  venueName?: string | undefined;
  venueAddress?: string | undefined;
  coverImageUrl?: string | undefined;
  startsAt: Date;
  endsAt?: Date | undefined;
  timezone: string;
  lat?: number | undefined;
  lng?: number | undefined;
}

export function toEvent(row: Selectable<EventsTable>): EventRecord {
  return {
    id: row.id,
    orgId: row.org_id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    venueName: row.venue_name,
    venueAddress: row.venue_address,
    coverImageUrl: row.cover_image_url,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    timezone: row.timezone,
    lat: row.lat,
    lng: row.lng,
    status: row.status,
    createdBy: row.created_by,
  };
}

// Derive the lat/lng/h3 columns from an optional map pin — both coordinates or nothing.
function geoColumns(
  lat?: number,
  lng?: number,
): { lat: number | null; lng: number | null; h3: string | null } {
  if (lat === undefined || lng === undefined) return { lat: null, lng: null, h3: null };
  return { lat, lng, h3: cellFor(lat, lng) };
}

export async function createEvent(input: NewEvent): Promise<EventRecord> {
  const row = await db
    .insertInto('events')
    .values({
      org_id: input.orgId,
      slug: input.slug,
      title: input.title,
      description: input.description ?? null,
      venue_name: input.venueName ?? null,
      venue_address: input.venueAddress ?? null,
      cover_image_url: input.coverImageUrl ?? null,
      starts_at: input.startsAt,
      ends_at: input.endsAt ?? null,
      timezone: input.timezone,
      ...geoColumns(input.lat, input.lng),
      created_by: input.createdBy,
    })
    .returningAll()
    .executeTakeFirstOrThrow();
  return toEvent(row);
}

export async function getEventById(id: string): Promise<EventRecord | undefined> {
  const row = await db.selectFrom('events').selectAll().where('id', '=', id).executeTakeFirst();
  return row ? toEvent(row) : undefined;
}

export async function listOrgEvents(orgId: string): Promise<EventRecord[]> {
  const rows = await db
    .selectFrom('events')
    .selectAll()
    .where('org_id', '=', orgId)
    .orderBy('created_at', 'desc')
    .execute();
  return rows.map(toEvent);
}

export async function updateEvent(id: string, patch: UpdateEventInput): Promise<void> {
  const set: Updateable<EventsTable> = { updated_at: new Date() };
  if (patch.title !== undefined) set.title = patch.title;
  if (patch.description !== undefined) set.description = patch.description;
  if (patch.venueName !== undefined) set.venue_name = patch.venueName;
  if (patch.venueAddress !== undefined) set.venue_address = patch.venueAddress;
  if (patch.coverImageUrl !== undefined) set.cover_image_url = patch.coverImageUrl;
  if (patch.startsAt !== undefined) set.starts_at = patch.startsAt;
  if (patch.endsAt !== undefined) set.ends_at = patch.endsAt;
  if (patch.timezone !== undefined) set.timezone = patch.timezone;
  // Geo is repinned only when both coordinates arrive together, so h3 never drifts out of sync.
  if (patch.lat !== undefined && patch.lng !== undefined) {
    Object.assign(set, geoColumns(patch.lat, patch.lng));
  }
  await db.updateTable('events').set(set).where('id', '=', id).execute();
}

export async function setEventStatus(id: string, status: EventStatus): Promise<void> {
  await db
    .updateTable('events')
    .set({ status, updated_at: new Date() })
    .where('id', '=', id)
    .execute();
}

export async function getPublishedEventBySlug(slug: string): Promise<EventRecord | undefined> {
  const row = await db
    .selectFrom('events')
    .innerJoin('organizations', 'organizations.id', 'events.org_id')
    .selectAll('events')
    .where('events.slug', '=', slug)
    .where('events.status', '=', 'published')
    .where('events.moderation_status', '=', 'ok')
    .where('organizations.suspended_at', 'is', null)
    .executeTakeFirst();
  return row ? toEvent(row) : undefined;
}
