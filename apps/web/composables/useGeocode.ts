export interface Place {
  label: string;
  lat: number;
  lng: number;
}

interface NominatimResult {
  display_name: string;
  lat: string;
  lon: string;
}

const NOMINATIM = 'https://nominatim.openstreetmap.org/search';

// Forward-geocode free text to candidate places via OpenStreetMap's Nominatim (keyless). Callers
// should debounce — the public endpoint asks for at most ~1 request/second.
export async function searchPlaces(query: string): Promise<Place[]> {
  const q = query.trim();
  if (q.length < 3) return [];
  const url = `${NOMINATIM}?format=json&limit=5&addressdetails=0&q=${encodeURIComponent(q)}`;
  const rows = await $fetch<NominatimResult[]>(url);
  return rows.map((r) => ({ label: r.display_name, lat: Number(r.lat), lng: Number(r.lon) }));
}
