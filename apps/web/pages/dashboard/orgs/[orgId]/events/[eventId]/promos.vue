<script setup lang="ts">
definePageMeta({ layout: 'dashboard', middleware: 'auth' });

interface PromoRow {
  id: string;
  code: string;
  discountType: string;
  discountValue: number;
  maxRedemptions: number | null;
  redeemedCount: number;
  active: boolean;
}

const route = useRoute();
const orgId = String(route.params.orgId);
const eventId = String(route.params.eventId);
const api = useApi();
const path = `/orgs/${orgId}/events/${eventId}/promo-codes`;

const promos = ref<PromoRow[]>([]);
const loading = ref(true);

async function load() {
  loading.value = true;
  try {
    promos.value = await api<PromoRow[]>(path);
  } finally {
    loading.value = false;
  }
}
onMounted(load);

const code = ref('');
const discountType = ref<'percent' | 'fixed'>('percent');
const discountValue = ref<number | null>(null);
const creating = ref(false);
const error = ref('');

async function create() {
  error.value = '';
  creating.value = true;
  try {
    await api(path, {
      method: 'POST',
      body: { code: code.value, discountType: discountType.value, discountValue: Number(discountValue.value) },
    });
    code.value = '';
    discountValue.value = null;
    await load();
  } catch {
    error.value = 'Could not create — code must be unique; percent is 1–100.';
  } finally {
    creating.value = false;
  }
}

async function deactivate(id: string) {
  await api(`${path}/${id}/deactivate`, { method: 'POST' });
  await load();
}

const describe = (p: PromoRow) =>
  p.discountType === 'percent' ? `${p.discountValue}% off` : `${formatMoney(p.discountValue)} off`;

useSeoMeta({ title: 'Promo codes' });
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
      <h1 class="mt-1 text-2xl font-bold tracking-tight">Promo codes</h1>
    </div>

    <Card class="max-w-lg">
      <CardHeader><CardTitle class="text-base">New code</CardTitle></CardHeader>
      <CardContent>
        <form class="space-y-4" @submit.prevent="create">
          <div class="space-y-1.5">
            <Label for="code">Code</Label>
            <Input id="code" v-model="code" placeholder="SAVE10" required />
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-1.5">
              <Label for="type">Type</Label>
              <select
                id="type"
                v-model="discountType"
                class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
              >
                <option value="percent">Percent</option>
                <option value="fixed">Fixed (USD)</option>
              </select>
            </div>
            <div class="space-y-1.5">
              <Label for="value">Value</Label>
              <Input id="value" v-model="discountValue" type="number" min="1" required />
            </div>
          </div>
          <p v-if="error" class="text-sm text-destructive">{{ error }}</p>
          <Button type="submit" data-testid="create-promo" :disabled="creating">
            {{ creating ? 'Creating…' : 'Create code' }}
          </Button>
        </form>
      </CardContent>
    </Card>

    <Card>
      <CardContent class="p-0">
        <p v-if="loading" class="p-6 text-muted-foreground">Loading…</p>
        <p v-else-if="!promos.length" class="p-6 text-muted-foreground">No codes yet.</p>
        <div v-else class="divide-y">
          <div
            v-for="p in promos"
            :key="p.id"
            class="flex items-center justify-between px-6 py-3"
            data-testid="promo-row"
          >
            <div>
              <div class="font-mono font-medium">{{ p.code }}</div>
              <div class="text-sm text-muted-foreground">
                {{ describe(p) }} · {{ p.redeemedCount }} redeemed
              </div>
            </div>
            <div class="flex items-center gap-3">
              <Badge :variant="p.active ? 'default' : 'secondary'">
                {{ p.active ? 'active' : 'inactive' }}
              </Badge>
              <Button
                v-if="p.active"
                variant="outline"
                size="sm"
                data-testid="deactivate-promo"
                @click="deactivate(p.id)"
              >
                Deactivate
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
