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
// Escape angle brackets and ampersands to their \uXXXX forms so organizer-supplied text can't
// terminate the JSON-LD block early with an injected closing tag — still valid JSON for crawlers.
const jsonLdSafe = JSON.stringify(jsonLd)
  .replace(/</g, '\\u003c')
  .replace(/>/g, '\\u003e')
  .replace(/&/g, '\\u0026');
useHead({
  script: [{ type: 'application/ld+json', innerHTML: jsonLdSafe }],
});
</script>

<template>
  <article class="max-w-3xl">
    <img
      v-if="ev.coverImageUrl"
      :src="ev.coverImageUrl"
      :alt="ev.title"
      class="mb-6 max-h-[360px] w-full rounded-xl border object-cover"
    />
    <h1 class="text-3xl font-bold tracking-tight">{{ ev.title }}</h1>
    <p class="mt-1 text-muted-foreground">{{ formatDateTime(ev.startsAt, ev.timezone) }}</p>
    <p v-if="ev.venueName" class="text-muted-foreground">
      {{ ev.venueName }}<span v-if="ev.venueAddress"> · {{ ev.venueAddress }}</span>
    </p>
    <p v-if="ev.description" class="mt-5 whitespace-pre-line">{{ ev.description }}</p>

    <Card class="mt-8">
      <CardContent class="divide-y p-0">
        <div v-for="t in tiers" :key="t.id" class="flex items-center justify-between px-5 py-3.5">
          <span>{{ t.name }}</span>
          <span class="font-semibold tabular-nums">{{ formatMoney(t.priceCents, t.currency) }}</span>
        </div>
      </CardContent>
    </Card>

    <div class="mt-6 flex items-center gap-3">
      <Button type="button" size="lg" disabled>
        Get tickets<span v-if="fromPrice !== null">&nbsp;· from {{ formatMoney(fromPrice) }}</span>
      </Button>
      <Badge variant="secondary">checkout coming soon</Badge>
    </div>
  </article>
</template>
