<script setup lang="ts">
interface AdminOrg {
  id: string;
  slug: string;
  name: string;
  suspended: boolean;
}

const api = useAdminApi();
const orgs = ref<AdminOrg[]>([]);
const loading = ref(true);
const busy = ref('');

async function load() {
  loading.value = true;
  try {
    orgs.value = await api<AdminOrg[]>('/orgs');
  } finally {
    loading.value = false;
  }
}
onMounted(load);

async function toggle(o: AdminOrg) {
  busy.value = o.id;
  try {
    await api(`/orgs/${o.id}/${o.suspended ? 'unsuspend' : 'suspend'}`, { method: 'POST' });
    await load();
  } finally {
    busy.value = '';
  }
}

useSeoMeta({ title: 'Organizations' });
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold tracking-tight">Organizations</h1>

    <Card>
      <CardContent class="p-0">
        <p v-if="loading" class="p-6 text-muted-foreground">Loading…</p>
        <p v-else-if="!orgs.length" class="p-6 text-muted-foreground">No organizations.</p>
        <div v-else class="divide-y">
          <div
            v-for="o in orgs"
            :key="o.id"
            class="flex items-center justify-between px-6 py-3"
            data-testid="org-row"
          >
            <div>
              <div class="font-medium">{{ o.name }}</div>
              <div class="font-mono text-sm text-muted-foreground">/{{ o.slug }}</div>
            </div>
            <div class="flex items-center gap-3">
              <Badge :variant="o.suspended ? 'secondary' : 'default'" data-testid="org-state">
                {{ o.suspended ? 'suspended' : 'active' }}
              </Badge>
              <Button
                :variant="o.suspended ? 'outline' : 'destructive'"
                size="sm"
                data-testid="toggle"
                :disabled="busy === o.id"
                @click="toggle(o)"
              >
                {{ o.suspended ? 'Unsuspend' : 'Suspend' }}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
