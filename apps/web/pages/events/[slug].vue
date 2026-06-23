<script setup lang="ts">
import type { EventDetailDto } from '~/types/event';

const route = useRoute();
const slug = String(route.params.slug);
const { public: config } = useRuntimeConfig();

const { data } = await useFetch<EventDetailDto>(`${config.apiBase}/events/${slug}`);
if (!data.value) {
  throw createError({ statusCode: 404, statusMessage: 'Event not found', fatal: true });
}

const ev = data.value.event;
const tiers = data.value.ticketTypes;
const fromPrice = tiers.length ? Math.min(...tiers.map((t) => t.priceCents)) : null;

useSeoMeta({
  title: ev.title,
  description: ev.description ?? `Tickets for ${ev.title}`,
  ogTitle: ev.title,
  ogDescription: ev.description ?? `Tickets for ${ev.title}`,
  ogImage: ev.coverImageUrl ?? undefined,
  ogType: 'website',
});

// JSON-LD Event for rich results; undefined keys are dropped by JSON.stringify.
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Event',
  name: ev.title,
  startDate: ev.startsAt,
  endDate: ev.endsAt ?? undefined,
  eventStatus: 'https://schema.org/EventScheduled',
  description: ev.description ?? undefined,
  image: ev.coverImageUrl ?? undefined,
  location: ev.venueName
    ? { '@type': 'Place', name: ev.venueName, address: ev.venueAddress ?? undefined }
    : undefined,
  offers: tiers.map((t) => ({
    '@type': 'Offer',
    name: t.name,
    price: (t.priceCents / 100).toFixed(2),
    priceCurrency: t.currency.toUpperCase(),
    availability: 'https://schema.org/InStock',
  })),
};
useHead({
  script: [{ type: 'application/ld+json', innerHTML: JSON.stringify(jsonLd) }],
});
</script>

<template>
  <article>
    <img v-if="ev.coverImageUrl" :src="ev.coverImageUrl" :alt="ev.title" class="event-cover" />
    <h1>{{ ev.title }}</h1>
    <p class="muted">{{ formatDateTime(ev.startsAt, ev.timezone) }}</p>
    <p v-if="ev.venueName" class="muted">
      {{ ev.venueName }}<span v-if="ev.venueAddress"> · {{ ev.venueAddress }}</span>
    </p>
    <p v-if="ev.description" style="margin-top: 1.25rem; white-space: pre-line">
      {{ ev.description }}
    </p>

    <div class="tiers">
      <div v-for="t in tiers" :key="t.id" class="tier">
        <span>{{ t.name }}</span>
        <span class="tier-price">{{ formatMoney(t.priceCents, t.currency) }}</span>
      </div>
    </div>

    <p style="margin-top: 1.5rem; display: flex; align-items: center; gap: 0.75rem">
      <button class="btn" type="button" disabled>
        Get tickets<span v-if="fromPrice !== null"> · from {{ formatMoney(fromPrice) }}</span>
      </button>
      <span class="muted">checkout coming soon</span>
    </p>
  </article>
</template>
