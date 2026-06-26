<script setup lang="ts">
import type { EventAnalytics } from '~/types/event';

definePageMeta({ layout: 'dashboard', middleware: 'auth' });

const route = useRoute();
const orgId = String(route.params.orgId);
const eventId = String(route.params.eventId);
const api = useApi();

const a = ref<EventAnalytics | null>(null);
const loading = ref(true);

async function load() {
  loading.value = true;
  try {
    a.value = await api<EventAnalytics>(`/orgs/${orgId}/events/${eventId}/analytics`);
  } finally {
    loading.value = false;
  }
}
onMounted(load);

const maxGross = computed(() =>
  Math.max(1, ...(a.value?.salesByDay.map((d) => d.grossCents) ?? [0])),
);
const ratePct = computed(() => Math.round((a.value?.checkinRate ?? 0) * 100));
const pct = (n: number, d: number) => (d > 0 ? Math.round((n / d) * 100) : 0);

useSeoMeta({ title: 'Analytics' });
</script>

<template>
  <div class="space-y-8">
    <div>
      <NuxtLink
        :to="`/dashboard/orgs/${orgId}/events/${eventId}`"
        class="text-sm text-muted-foreground hover:underline"
      >
        ← Event
      </NuxtLink>
      <h1 class="mt-1 text-2xl font-bold tracking-tight">Analytics</h1>
    </div>

    <p v-if="loading" class="text-muted-foreground">Loading…</p>

    <template v-else-if="a">
      <div class="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(200px,1fr))]">
        <Card>
          <CardHeader class="pb-2"><CardDescription>Tickets issued</CardDescription></CardHeader>
          <CardContent>
            <div class="text-3xl font-bold tabular-nums" data-testid="issued">
              {{ a.ticketsIssued }}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader class="pb-2"><CardDescription>Checked in</CardDescription></CardHeader>
          <CardContent>
            <div class="text-3xl font-bold tabular-nums" data-testid="checkedin">
              {{ a.ticketsCheckedIn }}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader class="pb-2"><CardDescription>Check-in rate</CardDescription></CardHeader>
          <CardContent>
            <div class="text-3xl font-bold tabular-nums" data-testid="rate">{{ ratePct }}%</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle class="text-base">Sales by ticket type</CardTitle></CardHeader>
        <CardContent class="space-y-4">
          <p v-if="!a.byTicketType.length" class="text-sm text-muted-foreground">No tiers.</p>
          <div v-for="t in a.byTicketType" :key="t.ticketTypeId" class="space-y-1.5">
            <div class="flex items-center justify-between text-sm">
              <span class="font-medium">{{ t.name }}</span>
              <span class="text-muted-foreground tabular-nums">{{ t.sold }} / {{ t.capacity }}</span>
            </div>
            <div class="h-2 w-full overflow-hidden rounded-full bg-secondary">
              <div class="h-full rounded-full bg-primary" :style="{ width: `${pct(t.sold, t.capacity)}%` }" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle class="text-base">Daily sales</CardTitle></CardHeader>
        <CardContent>
          <p v-if="!a.salesByDay.length" class="text-sm text-muted-foreground">No sales yet.</p>
          <div v-else class="flex items-stretch gap-2" style="height: 140px">
            <div v-for="d in a.salesByDay" :key="d.day" class="flex flex-1 flex-col items-center gap-1">
              <div class="flex w-full flex-1 items-end">
                <div
                  class="w-full rounded-t bg-primary"
                  :style="{ height: `${Math.max(4, pct(d.grossCents, maxGross))}%` }"
                  :title="`${formatMoney(d.grossCents)} · ${d.orders} orders`"
                />
              </div>
              <span class="text-[10px] text-muted-foreground">{{ d.day.slice(5) }}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </template>
  </div>
</template>
