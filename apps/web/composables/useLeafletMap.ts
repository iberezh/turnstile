import type { LeafletMouseEvent, Map as LMap, Marker } from 'leaflet';

type PickHandler = (lat: number, lng: number) => void;

// Thin wrapper over Leaflet + OpenStreetMap tiles with a single draggable-by-click pin. Leaflet is
// dynamically imported so it never runs during SSR (it touches `window` at module load).
export function useLeafletMap() {
  let map: LMap | null = null;
  let marker: Marker | null = null;

  async function setMarker(lat: number, lng: number): Promise<void> {
    if (!map) return;
    const L = await import('leaflet');
    if (marker) {
      marker.setLatLng([lat, lng]);
      return;
    }
    const icon = L.divIcon({
      className: 'ts-pin',
      html: '<span></span>',
      iconSize: [22, 22],
      iconAnchor: [11, 22],
    });
    marker = L.marker([lat, lng], { icon }).addTo(map);
  }

  async function init(
    el: HTMLElement,
    center: [number, number],
    zoom: number,
    onPick: PickHandler,
  ): Promise<void> {
    const L = await import('leaflet');
    map = L.map(el).setView(center, zoom);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);
    map.on('click', (e: LeafletMouseEvent) => {
      void setMarker(e.latlng.lat, e.latlng.lng);
      onPick(e.latlng.lat, e.latlng.lng);
    });
  }

  async function flyTo(lat: number, lng: number, zoom = 14): Promise<void> {
    map?.setView([lat, lng], zoom);
    await setMarker(lat, lng);
  }

  function destroy(): void {
    map?.remove();
    map = null;
    marker = null;
  }

  return { init, flyTo, setMarker, destroy };
}
