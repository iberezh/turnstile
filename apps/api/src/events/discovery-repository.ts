import { db } from '../db/client.js';
import { haversineKm, nearbyCells } from './geo.js';
import { type EventRecord, toEvent } from './repository.js';
import type { DiscoveryInput } from './schemas.js';

export interface NearbyEvent extends EventRecord {
  distanceKm: number;
}

// The k-ring radius searched first. Res-7 ring-12 covers a metro-sized area; if it comes up empty
// (sparse data) we fall back to all upcoming geotagged events, so the list is never blank.
const SEARCH_RING = 12;

// Marketplace-visible = published, not moderated away, and the owning org isn't suspended. The
// org-suspend / event-moderate flags are written by the separate platform control plane. Supports
// free-text title search, a starts_at date range, and pagination.
export async function searchPublishedEvents(query: DiscoveryInput): Promise<EventRecord[]> {
  let qb = db
    .selectFrom('events as e')
    .innerJoin('organizations as o', 'o.id', 'e.org_id')
    .where('e.status', '=', 'published')
    .where('e.moderation_status', '=', 'ok')
    .where('o.suspended_at', 'is', null);
  if (query.q) {
    // Escape LIKE wildcards so user input is matched literally (case-insensitive).
    qb = qb.where('e.title', 'ilike', `%${query.q.replace(/[%_\\]/g, '\\$&')}%`);
  }
  if (query.from) qb = qb.where('e.starts_at', '>=', query.from);
  if (query.to) qb = qb.where('e.starts_at', '<=', query.to);
  const rows = await qb
    .selectAll('e')
    .orderBy('e.starts_at', 'asc')
    .limit(query.limit)
    .offset(query.offset)
    .execute();
  return rows.map(toEvent);
}

// Upcoming, geotagged, marketplace-visible events nearest a point. H3 is the coarse index: we
// prefilter to the query cell's neighborhood, then rank the survivors precisely by great-circle km.
export async function nearestEvents(
  lat: number,
  lng: number,
  limit: number,
): Promise<NearbyEvent[]> {
  const base = db
    .selectFrom('events as e')
    .innerJoin('organizations as o', 'o.id', 'e.org_id')
    .where('e.status', '=', 'published')
    .where('e.moderation_status', '=', 'ok')
    .where('o.suspended_at', 'is', null)
    .where('e.starts_at', '>=', new Date())
    .where('e.lat', 'is not', null)
    .where('e.lng', 'is not', null);
  const cells = nearbyCells(lat, lng, SEARCH_RING);
  let rows = await base.where('e.h3', 'in', cells).selectAll('e').execute();
  if (rows.length === 0) rows = await base.selectAll('e').execute();
  return rows
    .map(toEvent)
    .map((e) => ({ ...e, distanceKm: haversineKm(lat, lng, e.lat ?? 0, e.lng ?? 0) }))
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, limit);
}
