<script setup lang="ts">
definePageMeta({ layout: 'dashboard', middleware: 'auth' });

interface CheckinResult {
  result: string;
  ticketId?: string;
  scannedAt?: string;
  status?: string;
}
interface FeedEntry {
  ticketId: string;
  scannedAt: string;
}

const route = useRoute();
const orgId = String(route.params.orgId);
const eventId = String(route.params.eventId);
const api = useApi();
const { public: cfg } = useRuntimeConfig();
const base = cfg.apiBase;

const token = ref('');
const last = ref<CheckinResult | null>(null);
const stats = ref<{ sold: number; checkedIn: number } | null>(null);
const feed = ref<FeedEntry[]>([]);
let es: EventSource | null = null;

async function refreshStats() {
  stats.value = await api<{ sold: number; checkedIn: number }>(
    `/orgs/${orgId}/events/${eventId}/checkin/stats`,
  );
}

async function scan() {
  const t = token.value.trim();
  if (!t) return;
  try {
    last.value = await api<CheckinResult>(`/orgs/${orgId}/events/${eventId}/checkin`, {
      method: 'POST',
      body: { token: t },
    });
  } catch (e) {
    last.value = (e as { data?: CheckinResult }).data ?? { result: 'error' };
  }
  token.value = '';
  await refreshStats();
}

// Tone of the result banner: admitted = good, already-in = warn, anything else = error.
const tone = computed(() => {
  const r = last.value?.result;
  if (r === 'admitted') return 'border-primary bg-primary/10 text-foreground';
  if (r === 'already_checked_in') return 'border-yellow-500/60 bg-yellow-500/10 text-foreground';
  return 'border-destructive/60 bg-destructive/10 text-foreground';
});
const label = computed(() => {
  switch (last.value?.result) {
    case 'admitted':
      return 'Admitted';
    case 'already_checked_in':
      return 'Already checked in';
    case 'wrong_event':
      return 'Wrong event';
    case 'not_valid':
      return 'Ticket not valid';
    case 'not_found':
      return 'Ticket not found';
    case 'invalid':
      return 'Invalid code';
    default:
      return last.value ? 'Error' : '';
  }
});

onMounted(() => {
  refreshStats();
  es = new EventSource(`${base}/orgs/${orgId}/events/${eventId}/checkin/stream`, {
    withCredentials: true,
  });
  es.onmessage = (ev) => {
    try {
      const d = JSON.parse(ev.data) as { type?: string; ticketId?: string; scannedAt?: string };
      if (d.type === 'checkin' && d.ticketId && d.scannedAt) {
        feed.value.unshift({ ticketId: d.ticketId, scannedAt: d.scannedAt });
        refreshStats();
      }
    } catch {
      /* keep-alive comment frames */
    }
  };
});
onUnmounted(() => es?.close());

useSeoMeta({ title: 'Door scanner' });
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
      <h1 class="mt-1 text-2xl font-bold tracking-tight">Door scanner</h1>
    </div>

    <div class="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div class="space-y-4">
        <Card>
          <CardHeader><CardTitle class="text-base">Scan a ticket</CardTitle></CardHeader>
          <CardContent>
            <form class="flex gap-2" @submit.prevent="scan">
              <Input
                id="token"
                v-model="token"
                placeholder="Scan or paste the ticket QR code"
                autofocus
              />
              <Button type="submit" data-testid="scan">Check in</Button>
            </form>
            <div
              v-if="last"
              class="mt-4 rounded-md border px-4 py-3 text-sm font-medium"
              :class="tone"
              data-testid="result"
            >
              {{ label }}
            </div>
          </CardContent>
        </Card>
      </div>

      <div class="space-y-4">
        <Card>
          <CardContent class="flex justify-between p-6">
            <div>
              <div class="text-sm text-muted-foreground">Checked in</div>
              <div class="text-2xl font-bold tabular-nums" data-testid="checkedin">
                {{ stats?.checkedIn ?? 0 }}
              </div>
            </div>
            <div class="text-right">
              <div class="text-sm text-muted-foreground">Sold</div>
              <div class="text-2xl font-bold tabular-nums">{{ stats?.sold ?? 0 }}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle class="text-base">Live admissions</CardTitle></CardHeader>
          <CardContent class="p-0">
            <p v-if="!feed.length" class="px-6 pb-6 text-sm text-muted-foreground">
              Waiting for scans…
            </p>
            <div v-else class="max-h-80 divide-y overflow-y-auto">
              <div
                v-for="(f, i) in feed"
                :key="`${f.ticketId}-${i}`"
                class="px-6 py-2.5 text-sm"
                data-testid="feed-row"
              >
                <div class="font-mono text-xs text-muted-foreground">{{ f.ticketId.slice(0, 8) }}</div>
                <div class="text-muted-foreground">{{ new Date(f.scannedAt).toLocaleTimeString() }}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>
