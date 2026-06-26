<script setup lang="ts">
import type { WalletTicket } from '~/types/checkout';

// The attendee's wallet — every ticket they've bought while signed in. Rendered client-side (the
// session cookie isn't available to SSR); an unauthenticated visitor is sent to sign in.
const api = useApi();
const tickets = ref<WalletTicket[] | null>(null);
const error = ref('');

function isUnauthorized(e: unknown): boolean {
  return !!e && typeof e === 'object' && 'statusCode' in e && (e as { statusCode?: number }).statusCode === 401;
}

onMounted(async () => {
  try {
    tickets.value = await api<WalletTicket[]>('/me/tickets');
  } catch (e) {
    if (isUnauthorized(e)) return navigateTo('/login?redirect=/tickets');
    error.value = 'We could not load your tickets.';
  }
});

interface EventGroup {
  title: string;
  slug: string;
  startsAt: string;
  timezone: string;
  items: WalletTicket[];
}
const groups = computed<EventGroup[]>(() => {
  const map = new Map<string, EventGroup>();
  for (const t of tickets.value ?? []) {
    const g = map.get(t.eventSlug) ?? { title: t.eventTitle, slug: t.eventSlug, startsAt: t.startsAt, timezone: t.timezone, items: [] };
    g.items.push(t);
    map.set(t.eventSlug, g);
  }
  return [...map.values()];
});

function statusVariant(status: string): 'secondary' | 'destructive' {
  return status === 'refunded' ? 'destructive' : 'secondary';
}

useSeoMeta({ title: 'My tickets' });
</script>

<template>
  <section class="container max-w-3xl pb-16 pt-24">
    <h1 class="font-display text-3xl font-semibold tracking-tight">My tickets</h1>
    <p class="mt-1 text-muted-foreground">Your QR codes, ready at the door.</p>

    <p v-if="error" class="mt-8 text-sm text-destructive">{{ error }}</p>

    <div v-else-if="tickets && groups.length === 0" class="mt-10 rounded-xl border border-dashed p-10 text-center">
      <p class="font-display text-lg font-semibold">No tickets yet</p>
      <p class="mt-1 text-sm text-muted-foreground">When you grab tickets, they'll show up here.</p>
      <NuxtLink
        to="/#whats-on"
        class="mt-4 inline-block rounded-lg bg-primary px-5 py-2.5 font-display text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
      >
        Find something to do
      </NuxtLink>
    </div>

    <div v-else class="mt-8 space-y-10">
      <section v-for="g in groups" :key="g.slug">
        <div class="flex items-baseline justify-between gap-3">
          <div>
            <NuxtLink :to="`/events/${g.slug}`" class="font-display text-xl font-semibold tracking-tight hover:text-primary">
              {{ g.title }}
            </NuxtLink>
            <p class="text-sm text-muted-foreground">{{ formatDateTime(g.startsAt, g.timezone) }}</p>
          </div>
          <span class="shrink-0 text-sm text-muted-foreground">{{ g.items.length }} ticket{{ g.items.length === 1 ? '' : 's' }}</span>
        </div>
        <div class="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div v-for="(t, i) in g.items" :key="t.id" class="space-y-2">
            <TicketQr :token="t.token" :label="`Ticket ${i + 1}`" />
            <div class="flex justify-center">
              <Badge :variant="statusVariant(t.status)">{{ t.status === 'checked_in' ? 'checked in' : t.status }}</Badge>
            </div>
          </div>
        </div>
      </section>
    </div>
  </section>
</template>
