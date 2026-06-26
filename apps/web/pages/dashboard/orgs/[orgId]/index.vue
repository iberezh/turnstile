<script setup lang="ts">
import type { EventDto } from '~/types/event';

definePageMeta({ layout: 'dashboard', middleware: 'auth' });

const route = useRoute();
const orgId = String(route.params.orgId);
const api = useApi();

const events = ref<EventDto[]>([]);
const loading = ref(true);

async function load() {
  loading.value = true;
  try {
    events.value = await api<EventDto[]>(`/orgs/${orgId}/events`);
  } finally {
    loading.value = false;
  }
}
onMounted(load);

const title = ref('');
const startsAt = ref('');
const venueName = ref('');
const venueAddress = ref('');
const lat = ref<number | null>(null);
const lng = ref<number | null>(null);
const creating = ref(false);
const error = ref('');

function onPick(p: { lat: number; lng: number; label?: string }) {
  lat.value = p.lat;
  lng.value = p.lng;
  if (p.label && !venueAddress.value) venueAddress.value = p.label;
}

async function createEvent() {
  error.value = '';
  creating.value = true;
  try {
    const geo = lat.value !== null && lng.value !== null ? { lat: lat.value, lng: lng.value } : {};
    const ev = await api<EventDto>(`/orgs/${orgId}/events`, {
      method: 'POST',
      body: {
        title: title.value,
        startsAt: startsAt.value,
        venueName: venueName.value || undefined,
        venueAddress: venueAddress.value || undefined,
        ...geo,
      },
    });
    await navigateTo(`/dashboard/orgs/${orgId}/events/${ev.id}`);
  } catch {
    error.value = 'Could not create it — needs a title (2+ chars) and a start date.';
  } finally {
    creating.value = false;
  }
}

const statusVariant = (s: string) => (s === 'published' ? 'default' : 'secondary');

useSeoMeta({ title: 'Events' });
</script>

<template>
  <div class="space-y-8">
    <div class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <NuxtLink to="/dashboard" class="text-sm text-muted-foreground hover:underline">
          ← Organizations
        </NuxtLink>
        <h1 class="mt-1 text-2xl font-bold tracking-tight">Events</h1>
      </div>
      <nav class="flex items-center gap-2">
        <NuxtLink :to="`/dashboard/orgs/${orgId}/finance`">
          <Button variant="outline" size="sm">Finance</Button>
        </NuxtLink>
        <NuxtLink :to="`/dashboard/orgs/${orgId}/partners`">
          <Button variant="outline" size="sm">Partners</Button>
        </NuxtLink>
        <NuxtLink :to="`/dashboard/orgs/${orgId}/loyalty`">
          <Button variant="outline" size="sm">Loyalty</Button>
        </NuxtLink>
      </nav>
    </div>

    <Card class="max-w-lg">
      <CardHeader><CardTitle class="text-base">New event</CardTitle></CardHeader>
      <CardContent>
        <form class="space-y-4" @submit.prevent="createEvent">
          <div class="space-y-1.5">
            <Label for="title">Title</Label>
            <Input id="title" v-model="title" required />
          </div>
          <div class="space-y-1.5">
            <Label for="starts">Starts at</Label>
            <Input id="starts" v-model="startsAt" type="datetime-local" required />
          </div>
          <div class="space-y-1.5">
            <Label for="venue">Venue (optional)</Label>
            <Input id="venue" v-model="venueName" />
          </div>
          <div class="space-y-1.5">
            <Label>Location (optional)</Label>
            <LocationPicker @pick="onPick" />
          </div>
          <p v-if="error" class="text-sm text-destructive">{{ error }}</p>
          <Button type="submit" data-testid="create-event" :disabled="creating">
            {{ creating ? 'Creating…' : 'Create event' }}
          </Button>
        </form>
      </CardContent>
    </Card>

    <div>
      <p v-if="loading" class="text-muted-foreground">Loading…</p>
      <p v-else-if="!events.length" class="text-muted-foreground">No events yet.</p>
      <div v-else class="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(260px,1fr))]">
        <NuxtLink
          v-for="e in events"
          :key="e.id"
          :to="`/dashboard/orgs/${orgId}/events/${e.id}`"
          class="group"
          data-testid="event-card"
        >
          <Card class="h-full transition-colors group-hover:border-primary">
            <CardHeader>
              <div class="flex items-start justify-between gap-2">
                <CardTitle class="text-base">{{ e.title }}</CardTitle>
                <Badge :variant="statusVariant(e.status)">{{ e.status }}</Badge>
              </div>
              <CardDescription>{{ formatDateTime(e.startsAt, e.timezone) }}</CardDescription>
            </CardHeader>
          </Card>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
