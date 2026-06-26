<script setup lang="ts">
import type { Place } from '~/composables/useGeocode';

// Lets an organizer pin an event: search an address (Nominatim), use the browser's location, or
// click the map. Emits the chosen coordinates (and a human label) upward.
const emit = defineEmits<{ pick: [{ lat: number; lng: number; label?: string }] }>();
const map = useLeafletMap();
const mapEl = ref<HTMLElement | null>(null);
const query = ref('');
const results = ref<Place[]>([]);
const coords = ref<{ lat: number; lng: number } | null>(null);
const searching = ref(false);
let timer: ReturnType<typeof setTimeout> | undefined;

onMounted(() => {
  if (mapEl.value) void map.init(mapEl.value, [40.7128, -74.006], 11, onMapPick);
});
onBeforeUnmount(() => map.destroy());

function onMapPick(lat: number, lng: number): void {
  coords.value = { lat, lng };
  results.value = [];
  emit('pick', { lat, lng });
}

function onInput(): void {
  if (timer) clearTimeout(timer);
  timer = setTimeout(async () => {
    searching.value = true;
    try {
      results.value = await searchPlaces(query.value);
    } finally {
      searching.value = false;
    }
  }, 500);
}

async function choose(p: Place): Promise<void> {
  query.value = p.label;
  results.value = [];
  coords.value = { lat: p.lat, lng: p.lng };
  await map.flyTo(p.lat, p.lng);
  emit('pick', { lat: p.lat, lng: p.lng, label: p.label });
}

function useMyLocation(): void {
  navigator.geolocation?.getCurrentPosition(async (pos) => {
    const { latitude, longitude } = pos.coords;
    coords.value = { lat: latitude, lng: longitude };
    await map.flyTo(latitude, longitude);
    emit('pick', { lat: latitude, lng: longitude });
  });
}
</script>

<template>
  <div class="space-y-2">
    <div class="relative">
      <div class="flex gap-2">
        <Input v-model="query" placeholder="Search an address or venue" @input="onInput" />
        <Button type="button" variant="outline" size="sm" class="shrink-0" @click="useMyLocation">
          Use my location
        </Button>
      </div>
      <ul
        v-if="results.length"
        class="absolute z-[500] mt-1 w-full overflow-hidden rounded-lg border bg-popover text-popover-foreground shadow-lg"
      >
        <li v-for="p in results" :key="p.label">
          <button
            type="button"
            class="block w-full truncate px-3 py-2 text-left text-sm transition-colors hover:bg-muted"
            @click="choose(p)"
          >
            {{ p.label }}
          </button>
        </li>
      </ul>
    </div>
    <div ref="mapEl" class="h-56 w-full overflow-hidden rounded-lg border" />
    <p class="text-xs text-muted-foreground">
      <span v-if="searching">Searching…</span>
      <span v-else-if="coords">Pinned at {{ coords.lat.toFixed(4) }}, {{ coords.lng.toFixed(4) }} — click the map to adjust.</span>
      <span v-else>Search, use your location, or click the map to drop a pin.</span>
    </p>
  </div>
</template>
