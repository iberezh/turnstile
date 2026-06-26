<script setup lang="ts">
import type { EventDto } from '~/types/event';

const { public: config } = useRuntimeConfig();
const { data: events } = await useFetch<EventDto[]>(`${config.apiBase}/events`);

// Compact, monospaced date for the ticket-stub eyebrow: "FRI · NOV 14 · 20:00".
function monoDate(iso: string, tz: string): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: tz || 'UTC',
  }).formatToParts(new Date(iso));
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
  return `${get('weekday')} · ${get('month')} ${get('day')} · ${get('hour')}:${get('minute')}`.toUpperCase();
}

useSeoMeta({
  title: 'Live events',
  description: 'Discover live events and walk right in with a ticket on your phone.',
  ogTitle: 'Turnstile — live events',
  ogDescription: 'Discover live events and walk right in with a ticket on your phone.',
});
</script>

<template>
  <div>
    <!-- Hero: the moment of admission -->
    <section class="relative overflow-hidden border-b border-border/60">
      <div class="bg-dotgrid absolute inset-0 opacity-70" />
      <div
        class="pointer-events-none absolute -right-32 top-1/2 h-[36rem] w-[36rem] -translate-y-1/2 rounded-full"
        style="background: radial-gradient(circle, hsl(var(--brand) / 0.22), transparent 62%)"
      />
      <div class="container relative grid items-center gap-10 py-20 lg:grid-cols-[1.1fr_0.9fr] lg:py-28">
        <div>
          <p class="font-mono text-xs uppercase tracking-[0.25em] text-primary">
            Live events · on sale now
          </p>
          <h1 class="mt-5 font-display text-5xl font-extrabold leading-[0.95] tracking-tight sm:text-7xl">
            Walk right <span class="text-primary">in.</span>
          </h1>
          <p class="mt-6 max-w-md text-lg text-muted-foreground">
            Discover live events and breeze through the door with a ticket that lives on your
            phone. No printouts, no queues — just tap and go.
          </p>
          <div class="mt-9 flex flex-wrap items-center gap-3">
            <a
              href="#whats-on"
              class="rounded-lg bg-gold px-6 py-3 font-mono text-sm font-bold uppercase tracking-wide text-[hsl(189_60%_8%)] transition-transform hover:-translate-y-0.5"
            >
              Browse events
            </a>
            <NuxtLink
              to="/dashboard"
              class="rounded-lg border border-border px-6 py-3 font-mono text-sm uppercase tracking-wide text-foreground transition-colors hover:bg-secondary"
            >
              Sell tickets
            </NuxtLink>
          </div>
        </div>
        <div class="flex justify-center lg:justify-end">
          <TurnstileMark spin class="h-56 w-56 drop-shadow-[0_0_45px_hsl(var(--brand)/0.35)] sm:h-72 sm:w-72" />
        </div>
      </div>
    </section>

    <!-- What's on -->
    <section id="whats-on" class="container scroll-mt-20 py-16">
      <div class="flex items-end justify-between border-b border-border/60 pb-4">
        <h2 class="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">What's on</h2>
        <span v-if="events?.length" class="font-mono text-xs text-muted-foreground">
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
          class="group relative block overflow-hidden rounded-xl border bg-card transition-all duration-200 hover:-translate-y-1 hover:border-primary/60 hover:shadow-[0_18px_50px_-14px_hsl(var(--brand)/0.4)]"
        >
          <div class="relative aspect-[16/10] overflow-hidden">
            <img
              v-if="e.coverImageUrl"
              :src="e.coverImageUrl"
              :alt="e.title"
              class="h-full w-full object-cover"
            />
            <div
              v-else
              class="bg-dotgrid flex h-full w-full items-center justify-center"
              style="background-color: hsl(var(--secondary))"
            >
              <TurnstileMark class="h-16 w-16 opacity-60 transition-transform duration-500 group-hover:rotate-[120deg]" />
            </div>
          </div>
          <!-- tear-off edge -->
          <div class="perforation relative h-2 bg-card">
            <span class="absolute -left-2 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-background" />
            <span class="absolute -right-2 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-background" />
          </div>
          <div class="p-5">
            <div class="font-mono text-[0.7rem] uppercase tracking-widest text-primary">
              {{ monoDate(e.startsAt, e.timezone) }}
            </div>
            <h3 class="mt-2 font-display text-lg font-bold leading-snug">{{ e.title }}</h3>
            <p v-if="e.venueName" class="mt-1 text-sm text-muted-foreground">{{ e.venueName }}</p>
          </div>
        </NuxtLink>
      </div>
    </section>
  </div>
</template>
