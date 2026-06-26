import { gridDisk, latLngToCell } from 'h3-js';

// Fixed H3 resolution for event indexing. Res 7 ≈ 5 km across — neighborhood-scale, a good prefilter
// granularity for "events near a city" without exploding the candidate set.
export const H3_RES = 7;

// The hex cell an event lives in (computed once at write time and stored alongside lat/lng).
export function cellFor(lat: number, lng: number): string {
  return latLngToCell(lat, lng, H3_RES);
}

// Candidate cells within k rings of a point — the coarse spatial prefilter for nearest-events.
export function nearbyCells(lat: number, lng: number, k: number): string[] {
  return gridDisk(latLngToCell(lat, lng, H3_RES), k);
}

const EARTH_RADIUS_KM = 6371;

// Great-circle distance, used to rank the H3-prefiltered candidates precisely and to show "N km away".
export function haversineKm(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const toRad = (d: number): number => (d * Math.PI) / 180;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2;
  return EARTH_RADIUS_KM * 2 * Math.asin(Math.sqrt(h));
}
