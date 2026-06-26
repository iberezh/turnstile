<script setup lang="ts">
definePageMeta({ layout: 'dashboard', middleware: 'auth' });

interface PartnerStats {
  id: string;
  code: string;
  name: string;
  commissionBps: number;
  active: boolean;
  attributedOrders: number;
  grossCents: number;
  commissionCents: number;
}

const route = useRoute();
const orgId = String(route.params.orgId);
const api = useApi();
const path = `/orgs/${orgId}/partners`;

const partners = ref<PartnerStats[]>([]);
const loading = ref(true);

async function load() {
  loading.value = true;
  try {
    partners.value = await api<PartnerStats[]>(path);
  } finally {
    loading.value = false;
  }
}
onMounted(load);

const code = ref('');
const name = ref('');
const commissionPct = ref<number | null>(null);
const creating = ref(false);
const error = ref('');

async function create() {
  error.value = '';
  creating.value = true;
  try {
    await api(path, {
      method: 'POST',
      body: { code: code.value, name: name.value, commissionBps: Math.round(Number(commissionPct.value) * 100) },
    });
    code.value = '';
    name.value = '';
    commissionPct.value = null;
    await load();
  } catch {
    error.value = 'Could not create — code must be unique; commission 0–100%.';
  } finally {
    creating.value = false;
  }
}

async function deactivate(id: string) {
  await api(`${path}/${id}/deactivate`, { method: 'POST' });
  await load();
}

useSeoMeta({ title: 'Partners' });
</script>

<template>
  <div class="space-y-6">
    <div>
      <NuxtLink :to="`/dashboard/orgs/${orgId}`" class="text-sm text-muted-foreground hover:underline">
        ← Events
      </NuxtLink>
      <h1 class="mt-1 text-2xl font-bold tracking-tight">Partners</h1>
    </div>

    <Card class="max-w-lg">
      <CardHeader><CardTitle class="text-base">New partner</CardTitle></CardHeader>
      <CardContent>
        <form class="space-y-4" @submit.prevent="create">
          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-1.5">
              <Label for="p-code">Referral code</Label>
              <Input id="p-code" v-model="code" placeholder="ACME" required />
            </div>
            <div class="space-y-1.5">
              <Label for="p-pct">Commission %</Label>
              <Input id="p-pct" v-model="commissionPct" type="number" min="0" max="100" step="0.1" required />
            </div>
          </div>
          <div class="space-y-1.5">
            <Label for="p-name">Name</Label>
            <Input id="p-name" v-model="name" placeholder="Acme Affiliates" required />
          </div>
          <p v-if="error" class="text-sm text-destructive">{{ error }}</p>
          <Button type="submit" data-testid="create-partner" :disabled="creating">
            {{ creating ? 'Creating…' : 'Add partner' }}
          </Button>
        </form>
      </CardContent>
    </Card>

    <Card>
      <CardContent class="p-0">
        <p v-if="loading" class="p-6 text-muted-foreground">Loading…</p>
        <p v-else-if="!partners.length" class="p-6 text-muted-foreground">No partners yet.</p>
        <div v-else class="divide-y">
          <div
            v-for="p in partners"
            :key="p.id"
            class="flex items-center justify-between px-6 py-3"
            data-testid="partner-row"
          >
            <div>
              <div class="font-medium">{{ p.name }} <span class="font-mono text-muted-foreground">/{{ p.code }}</span></div>
              <div class="text-sm text-muted-foreground">
                {{ (p.commissionBps / 100) }}% · {{ p.attributedOrders }} orders ·
                commission {{ formatMoney(p.commissionCents) }}
              </div>
            </div>
            <div class="flex items-center gap-3">
              <Badge :variant="p.active ? 'default' : 'secondary'">{{ p.active ? 'active' : 'inactive' }}</Badge>
              <Button v-if="p.active" variant="outline" size="sm" @click="deactivate(p.id)">Deactivate</Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
