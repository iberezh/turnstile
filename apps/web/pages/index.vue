<script setup lang="ts">
import type { EventDto } from '~/types/event';

const { public: config } = useRuntimeConfig();
const { data: events } = await useFetch<EventDto[]>(`${config.apiBase}/events`);

useSeoMeta({
  title: 'Live events',
  description: 'Discover live events and walk right in with a ticket on your phone.',
  ogTitle: 'Turnstile — live events',
  ogDescription: 'Discover live events and walk right in with a ticket on your phone.',
});
</script>

<template>
  <div>
    <!-- Hero -->
    <section class="relative overflow-hidden border-b border-border/70">
      <div class="bg-grid absolute inset-0 opacity-60" />
      <div
        class="pointer-events-none absolute -right-24 -top-24 h-[30rem] w-[30rem] rounded-full"
        style="background: radial-gradient(circle, hsl(var(--sun) / 0.22), transparent 60%)"
      />
      <div class="container relative grid items-center gap-10 py-20 lg:grid-cols-[1.15fr_0.85fr] lg:py-28">
        <div>
          <p class="font-display text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            Live events · on sale now
          </p>
          <h1 class="mt-5 font-display text-5xl font-semibold leading-[1.02] tracking-tight sm:text-7xl">
            Walk right <span class="text-primary">in.</span>
          </h1>
          <p class="mt-6 max-w-md text-lg text-muted-foreground">
            Discover live events and breeze through the door with a ticket that lives on your phone.
            No printouts, no queues — just tap and go.
          </p>
          <div class="mt-9 flex flex-wrap items-center gap-3">
            <a
              href="#whats-on"
              class="rounded-lg bg-sun px-6 py-3 font-display text-sm font-semibold text-sun-foreground shadow-sm transition-transform hover:-translate-y-0.5"
            >
              Browse events
            </a>
            <NuxtLink
              to="/dashboard"
              class="rounded-lg border border-border px-6 py-3 font-display text-sm font-semibold transition-colors hover:bg-secondary"
            >
              Sell tickets
            </NuxtLink>
          </div>
        </div>
        <div class="flex justify-center lg:justify-end">
          <div class="grid h-56 w-56 place-items-center rounded-3xl border border-border bg-card shadow-sm sm:h-72 sm:w-72">
            <ChevronMark class="h-28 w-28 text-primary sm:h-36 sm:w-36" />
          </div>
        </div>
      </div>
    </section>

    <!-- What's on -->
    <section id="whats-on" class="container scroll-mt-20 py-16">
      <div class="flex items-end justify-between border-b border-border/70 pb-4">
        <h2 class="font-display text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          What's on
        </h2>
        <span v-if="events?.length" class="text-sm text-muted-foreground">
          {{ events.length }} event{{ events.length === 1 ? '' : 's' }}
        </span>
      </div>

      <p v-if="!events || events.length === 0" class="py-16 text-center text-muted-foreground">
        No events on sale yet. Check back soon.
      </p>

      <div v-else class="mt-8 grid gap-6 [grid-template-columns:repeat(auto-fill,minmax(280px,1fr))]">
        <NuxtLink
          v-for="e in events"
          :key="e.id"
          :to="`/events/${e.slug}`"
          class="group block overflow-hidden rounded-xl border bg-card shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-primary/60 hover:shadow-lg"
        >
          <div class="relative aspect-[16/10] overflow-hidden">
            <img
              v-if="e.coverImageUrl"
              :src="e.coverImageUrl"
              :alt="e.title"
              class="h-full w-full object-cover"
            />
            <div v-else class="flex h-full w-full items-center justify-center bg-secondary">
              <ChevronMark class="h-14 w-14 text-primary opacity-70 transition-transform duration-300 group-hover:translate-x-1" />
            </div>
          </div>
          <div class="p-5">
            <div class="font-display text-xs font-semibold uppercase tracking-wider text-primary">
              {{ formatDateTime(e.startsAt, e.timezone) }}
            </div>
            <h3 class="mt-2 font-display text-lg font-semibold leading-snug">{{ e.title }}</h3>
            <p v-if="e.venueName" class="mt-1 text-sm text-muted-foreground">{{ e.venueName }}</p>
          </div>
        </NuxtLink>
      </div>
    </section>
  </div>
</template>
