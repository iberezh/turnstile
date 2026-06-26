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
  <article class="container max-w-3xl pb-12 pt-24">
    <NuxtLink
      to="/"
      class="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
    >
      ← What's on
    </NuxtLink>
    <img
      v-if="ev.coverImageUrl"
      :src="ev.coverImageUrl"
      :alt="ev.title"
      class="mb-6 mt-4 max-h-[360px] w-full rounded-xl border object-cover"
    />
    <p class="mt-6 font-display text-xs font-semibold uppercase tracking-[0.18em] text-primary">
      {{ formatDateTime(ev.startsAt, ev.timezone) }}
    </p>
    <h1 class="mt-3 font-display text-4xl font-semibold leading-tight tracking-tight">
      {{ ev.title }}
    </h1>
    <p v-if="ev.venueName" class="mt-2 text-muted-foreground">
      {{ ev.venueName }}<span v-if="ev.venueAddress"> · {{ ev.venueAddress }}</span>
    </p>
    <p v-if="ev.description" class="mt-5 whitespace-pre-line text-muted-foreground">
      {{ ev.description }}
    </p>

    <CheckoutPanel v-if="tiers.length" :slug="slug" :tiers="tiers" class="mt-8" />
    <Badge v-else variant="secondary" class="mt-8">Tickets not on sale yet</Badge>
  </article>
</template>
