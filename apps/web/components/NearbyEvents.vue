<script setup lang="ts">
import type { Place } from '~/composables/useGeocode';
import type { NearbyEventDto } from '~/types/event';

// Marketplace "near you": pick a location (browser geolocation or an address search), then list the
// nearest upcoming events with their distance. Powered by the H3-indexed GET /events/near.
const { public: cfg } = useRuntimeConfig();
const query = ref('');
const results = ref<Place[]>([]);
const origin = ref<{ label: string } | null>(null);
const events = ref<NearbyEventDto[] | null>(null);
const loading = ref(false);
let timer: ReturnType<typeof setTimeout> | undefined;

function onInput(): void {
  if (timer) clearTimeout(timer);
  timer = setTimeout(async () => {
    results.value = await searchPlaces(query.value);
  }, 500);
}

async function locate(lat: number, lng: number, label: string): Promise<void> {
  origin.value = { label };
  results.value = [];
  query.value = '';
  loading.value = true;
  try {
    events.value = await $fetch<NearbyEventDto[]>(`${cfg.apiBase}/events/near`, {
      query: { lat, lng, limit: 8 },
    });
  } finally {
    loading.value = false;
  }
}

function useMyLocation(): void {
  navigator.geolocation?.getCurrentPosition(
    (pos) => void locate(pos.coords.latitude, pos.coords.longitude, 'you'),
    () => {
      origin.value = { label: 'unavailable' };
    },
  );
}

function distance(km: number): string {
  return km < 10 ? `${km.toFixed(1)} km` : `${Math.round(km)} km`;
}
</script>

<template>
  <section class="container py-16">
    <div class="flex flex-wrap items-end justify-between gap-4 border-b border-border/70 pb-4">
      <h2 class="font-display text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        Near you
      </h2>
      <div class="relative flex w-full max-w-md gap-2">
        <Input v-model="query" placeholder="Enter a city or address" @input="onInput" />
        <Button type="button" variant="outline" size="sm" class="shrink-0" @click="useMyLocation">
          Use my location
        </Button>
        <ul
          v-if="results.length"
          class="absolute left-0 top-11 z-[500] w-full overflow-hidden rounded-lg border bg-popover text-popover-foreground shadow-lg"
        >
          <li v-for="p in results" :key="p.label">
            <button
              type="button"
              class="block w-full truncate px-3 py-2 text-left text-sm transition-colors hover:bg-muted"
              @click="locate(p.lat, p.lng, p.label.split(',')[0] ?? p.label)"
            >
              {{ p.label }}
            </button>
          </li>
        </ul>
      </div>
    </div>

    <p v-if="!origin" class="py-10 text-center text-muted-foreground">
      Share your location to see what's happening nearby.
    </p>
    <p v-else-if="loading" class="py-10 text-center text-muted-foreground">Finding events near you…</p>
    <p v-else-if="!events?.length" class="py-10 text-center text-muted-foreground">
      Nothing nearby just yet — try a different place.
    </p>
    <div v-else class="mt-8 space-y-3">
      <p class="text-sm text-muted-foreground">
        Nearest to <span class="font-medium text-foreground">{{ origin.label }}</span>
      </p>
      <NuxtLink
        v-for="e in events"
        :key="e.id"
        :to="`/events/${e.slug}`"
        class="flex items-center justify-between gap-4 rounded-xl border bg-card p-4 transition-colors hover:border-primary/60"
      >
        <div class="min-w-0">
          <p class="truncate font-display font-semibold">{{ e.title }}</p>
          <p class="truncate text-sm text-muted-foreground">
            {{ formatDateTime(e.startsAt, e.timezone) }}<span v-if="e.venueName"> · {{ e.venueName }}</span>
          </p>
        </div>
        <Badge variant="secondary" class="shrink-0">{{ distance(e.distanceKm) }} away</Badge>
      </NuxtLink>
    </div>
  </section>
</template>
