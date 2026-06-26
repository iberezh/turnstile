<script setup lang="ts">
definePageMeta({ layout: 'dashboard', middleware: 'auth' });

interface Summary {
  currency: string;
  grossCents: number;
  feeCents: number;
  refundedCents: number;
  netCents: number;
  platformFeeCents: number;
  paidOrders: number;
  refundedOrders: number;
}
interface EventFinance extends Summary {
  eventId: string;
  title: string;
}

const route = useRoute();
const orgId = String(route.params.orgId);
const api = useApi();

const data = ref<{ summary: Summary[]; events: EventFinance[] } | null>(null);
const loading = ref(true);

async function load() {
  loading.value = true;
  try {
    data.value = await api<{ summary: Summary[]; events: EventFinance[] }>(
      `/orgs/${orgId}/finance/summary`,
    );
  } finally {
    loading.value = false;
  }
}
onMounted(load);

useSeoMeta({ title: 'Finance' });
</script>

<template>
  <div class="space-y-8">
    <div>
      <NuxtLink :to="`/dashboard/orgs/${orgId}`" class="text-sm text-muted-foreground hover:underline">
        ← Events
      </NuxtLink>
      <h1 class="mt-1 text-2xl font-bold tracking-tight">Finance</h1>
    </div>

    <p v-if="loading" class="text-muted-foreground">Loading…</p>
    <p v-else-if="!data || !data.summary.length" class="text-muted-foreground">No sales yet.</p>

    <template v-else>
      <div v-for="s in data.summary" :key="s.currency" class="space-y-3">
        <h2 class="text-sm font-medium uppercase text-muted-foreground">{{ s.currency }}</h2>
        <div class="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(180px,1fr))]">
          <Card>
            <CardHeader class="pb-2"><CardDescription>Gross (paid)</CardDescription></CardHeader>
            <CardContent>
              <div class="text-2xl font-bold tabular-nums" data-testid="gross">
                {{ formatMoney(s.grossCents, s.currency) }}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader class="pb-2"><CardDescription>Organizer net</CardDescription></CardHeader>
            <CardContent>
              <div class="text-2xl font-bold tabular-nums" data-testid="net">
                {{ formatMoney(s.netCents, s.currency) }}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader class="pb-2"><CardDescription>Platform fees</CardDescription></CardHeader>
            <CardContent>
              <div class="text-2xl font-bold tabular-nums">
                {{ formatMoney(s.platformFeeCents, s.currency) }}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader class="pb-2"><CardDescription>Refunded</CardDescription></CardHeader>
            <CardContent>
              <div class="text-2xl font-bold tabular-nums">
                {{ formatMoney(s.refundedCents, s.currency) }}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle class="text-base">By event</CardTitle></CardHeader>
        <CardContent class="p-0">
          <div class="divide-y">
            <div
              v-for="e in data.events"
              :key="`${e.eventId}-${e.currency}`"
              class="flex items-center justify-between px-6 py-3"
            >
              <div>
                <div class="font-medium">{{ e.title }}</div>
                <div class="text-sm text-muted-foreground">
                  {{ e.paidOrders }} paid · {{ e.refundedOrders }} refunded
                </div>
              </div>
              <span class="font-semibold tabular-nums">{{ formatMoney(e.netCents, e.currency) }}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </template>
  </div>
</template>
