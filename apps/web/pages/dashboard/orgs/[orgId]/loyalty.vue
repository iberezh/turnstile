<script setup lang="ts">
definePageMeta({ layout: 'dashboard', middleware: 'auth' });

interface LoyaltyAccount {
  email: string;
  pointsBalance: number;
}

const route = useRoute();
const orgId = String(route.params.orgId);
const api = useApi();

const accounts = ref<LoyaltyAccount[]>([]);
const loading = ref(true);

async function load() {
  loading.value = true;
  try {
    accounts.value = await api<LoyaltyAccount[]>(`/orgs/${orgId}/loyalty/accounts`);
  } finally {
    loading.value = false;
  }
}
onMounted(load);

const email = ref('');
const delta = ref<number | null>(null);
const reason = ref('');
const saving = ref(false);
const error = ref('');

async function adjust() {
  error.value = '';
  saving.value = true;
  try {
    await api(`/orgs/${orgId}/loyalty/adjust`, {
      method: 'POST',
      body: { email: email.value, delta: Number(delta.value), reason: reason.value },
    });
    email.value = '';
    delta.value = null;
    reason.value = '';
    await load();
  } catch {
    error.value = 'Could not adjust — for a deduction the balance must cover it.';
  } finally {
    saving.value = false;
  }
}

useSeoMeta({ title: 'Loyalty' });
</script>

<template>
  <div class="space-y-6">
    <div>
      <NuxtLink :to="`/dashboard/orgs/${orgId}`" class="text-sm text-muted-foreground hover:underline">
        ← Events
      </NuxtLink>
      <h1 class="mt-1 text-2xl font-bold tracking-tight">Loyalty</h1>
    </div>

    <Card class="max-w-lg">
      <CardHeader>
        <CardTitle class="text-base">Adjust points</CardTitle>
        <CardDescription>Grant or deduct points for an attendee (by email).</CardDescription>
      </CardHeader>
      <CardContent>
        <form class="space-y-4" @submit.prevent="adjust">
          <div class="space-y-1.5">
            <Label for="l-email">Email</Label>
            <Input id="l-email" v-model="email" type="email" required />
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-1.5">
              <Label for="l-delta">Delta (+/−)</Label>
              <Input id="l-delta" v-model="delta" type="number" required />
            </div>
            <div class="space-y-1.5">
              <Label for="l-reason">Reason</Label>
              <Input id="l-reason" v-model="reason" placeholder="goodwill" required />
            </div>
          </div>
          <p v-if="error" class="text-sm text-destructive">{{ error }}</p>
          <Button type="submit" data-testid="adjust" :disabled="saving">
            {{ saving ? 'Saving…' : 'Apply' }}
          </Button>
        </form>
      </CardContent>
    </Card>

    <Card>
      <CardHeader><CardTitle class="text-base">Accounts</CardTitle></CardHeader>
      <CardContent class="p-0">
        <p v-if="loading" class="px-6 pb-6 text-muted-foreground">Loading…</p>
        <p v-else-if="!accounts.length" class="px-6 pb-6 text-muted-foreground">No accounts yet.</p>
        <div v-else class="divide-y">
          <div
            v-for="a in accounts"
            :key="a.email"
            class="flex items-center justify-between px-6 py-3"
            data-testid="loyalty-row"
          >
            <span class="truncate">{{ a.email }}</span>
            <span class="font-semibold tabular-nums">{{ a.pointsBalance }} pts</span>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
