<script setup lang="ts">
import type { EventDto, TicketTypeDto } from '~/types/event';

definePageMeta({ layout: 'dashboard', middleware: 'auth' });

const route = useRoute();
const orgId = String(route.params.orgId);
const eventId = String(route.params.eventId);
const api = useApi();

const event = ref<EventDto | null>(null);
const tiers = ref<TicketTypeDto[]>([]);
const notice = ref('');

async function load() {
  event.value = await api<EventDto>(`/orgs/${orgId}/events/${eventId}`);
  tiers.value = await api<TicketTypeDto[]>(`/orgs/${orgId}/events/${eventId}/ticket-types`);
}
onMounted(load);

async function publish() {
  notice.value = '';
  try {
    await api(`/orgs/${orgId}/events/${eventId}/publish`, { method: 'POST' });
    await load();
  } catch {
    notice.value = 'Add at least one ticket type before publishing.';
  }
}
async function cancelEvent() {
  await api(`/orgs/${orgId}/events/${eventId}/cancel`, { method: 'POST' });
  await load();
}

const name = ref('');
const price = ref<number | null>(null);
const capacity = ref<number | null>(null);
const adding = ref(false);
const tierError = ref('');

async function addTier() {
  tierError.value = '';
  adding.value = true;
  try {
    await api(`/orgs/${orgId}/events/${eventId}/ticket-types`, {
      method: 'POST',
      body: {
        name: name.value,
        priceCents: Math.round(Number(price.value) * 100),
        capacity: Number(capacity.value),
      },
    });
    name.value = '';
    price.value = null;
    capacity.value = null;
    await load();
  } catch {
    tierError.value = 'Could not add the tier — check name, price and capacity.';
  } finally {
    adding.value = false;
  }
}

const statusVariant = (s: string) => (s === 'published' ? 'default' : 'secondary');

useSeoMeta({ title: 'Manage event' });
</script>

<template>
  <div v-if="event" class="space-y-8">
    <div>
      <NuxtLink :to="`/dashboard/orgs/${orgId}`" class="text-sm text-muted-foreground hover:underline">
        ← Events
      </NuxtLink>
      <div class="mt-1 flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <h1 class="text-2xl font-bold tracking-tight">{{ event.title }}</h1>
          <Badge :variant="statusVariant(event.status)" data-testid="status">{{ event.status }}</Badge>
        </div>
        <div class="flex items-center gap-2">
          <Button
            v-if="event.status !== 'published'"
            size="sm"
            data-testid="publish"
            @click="publish"
          >
            Publish
          </Button>
          <Button
            v-if="event.status !== 'cancelled'"
            variant="outline"
            size="sm"
            @click="cancelEvent"
          >
            Cancel
          </Button>
        </div>
      </div>
      <p class="mt-1 text-muted-foreground">{{ formatDateTime(event.startsAt, event.timezone) }}</p>
      <p v-if="notice" class="mt-2 text-sm text-destructive">{{ notice }}</p>
    </div>

    <div class="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader><CardTitle class="text-base">Ticket types</CardTitle></CardHeader>
        <CardContent class="p-0">
          <p v-if="!tiers.length" class="px-6 pb-6 text-sm text-muted-foreground">No tiers yet.</p>
          <div v-else class="divide-y">
            <div
              v-for="t in tiers"
              :key="t.id"
              class="flex items-center justify-between px-6 py-3"
              data-testid="tier-row"
            >
              <div>
                <div class="font-medium">{{ t.name }}</div>
                <div class="text-sm text-muted-foreground">{{ t.capacity }} available</div>
              </div>
              <span class="font-semibold tabular-nums">{{ formatMoney(t.priceCents, t.currency) }}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle class="text-base">Add a ticket type</CardTitle></CardHeader>
        <CardContent>
          <form class="space-y-4" @submit.prevent="addTier">
            <div class="space-y-1.5">
              <Label for="t-name">Name</Label>
              <Input id="t-name" v-model="name" placeholder="General Admission" required />
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1.5">
                <Label for="t-price">Price (USD)</Label>
                <Input id="t-price" v-model="price" type="number" min="0" step="0.01" required />
              </div>
              <div class="space-y-1.5">
                <Label for="t-cap">Capacity</Label>
                <Input id="t-cap" v-model="capacity" type="number" min="1" required />
              </div>
            </div>
            <p v-if="tierError" class="text-sm text-destructive">{{ tierError }}</p>
            <Button type="submit" data-testid="add-tier" :disabled="adding">
              {{ adding ? 'Adding…' : 'Add ticket type' }}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
