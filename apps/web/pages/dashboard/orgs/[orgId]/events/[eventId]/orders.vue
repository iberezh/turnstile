<script setup lang="ts">
definePageMeta({ layout: 'dashboard', middleware: 'auth' });

interface OrderRow {
  id: string;
  buyerEmail: string;
  amountCents: number;
  feeCents: number;
  currency: string;
  status: string;
  createdAt: string;
}

const route = useRoute();
const orgId = String(route.params.orgId);
const eventId = String(route.params.eventId);
const api = useApi();

const orders = ref<OrderRow[]>([]);
const loading = ref(true);
const busy = ref('');

async function load() {
  loading.value = true;
  try {
    orders.value = await api<OrderRow[]>(`/orgs/${orgId}/events/${eventId}/orders`);
  } finally {
    loading.value = false;
  }
}
onMounted(load);

async function refund(id: string) {
  busy.value = id;
  try {
    await api(`/orgs/${orgId}/events/${eventId}/orders/${id}/refund`, { method: 'POST' });
    await load();
  } finally {
    busy.value = '';
  }
}

useSeoMeta({ title: 'Orders' });
</script>

<template>
  <div class="space-y-6">
    <div>
      <NuxtLink
        :to="`/dashboard/orgs/${orgId}/events/${eventId}`"
        class="text-sm text-muted-foreground hover:underline"
      >
        ← Event
      </NuxtLink>
      <h1 class="mt-1 text-2xl font-bold tracking-tight">Orders</h1>
    </div>

    <Card>
      <CardContent class="p-0">
        <p v-if="loading" class="p-6 text-muted-foreground">Loading…</p>
        <p v-else-if="!orders.length" class="p-6 text-muted-foreground">No orders yet.</p>
        <div v-else class="divide-y">
          <div
            v-for="o in orders"
            :key="o.id"
            class="flex items-center justify-between gap-4 px-6 py-3"
            data-testid="order-row"
          >
            <div class="min-w-0">
              <div class="truncate font-medium">{{ o.buyerEmail }}</div>
              <div class="text-sm text-muted-foreground">
                {{ formatMoney(o.amountCents, o.currency) }} ·
                fee {{ formatMoney(o.feeCents, o.currency) }}
              </div>
            </div>
            <div class="flex items-center gap-3">
              <Badge :variant="o.status === 'paid' ? 'default' : 'secondary'" data-testid="order-status">
                {{ o.status }}
              </Badge>
              <Button
                v-if="o.status === 'paid'"
                variant="outline"
                size="sm"
                data-testid="refund"
                :disabled="busy === o.id"
                @click="refund(o.id)"
              >
                {{ busy === o.id ? 'Refunding…' : 'Refund' }}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
