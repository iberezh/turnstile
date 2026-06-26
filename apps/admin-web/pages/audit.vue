<script setup lang="ts">
interface AuditRow {
  id: string;
  actorId: string;
  action: string;
  targetType: string;
  targetId: string;
  at: string;
}

const api = useAdminApi();
const rows = ref<AuditRow[]>([]);
const loading = ref(true);

onMounted(async () => {
  try {
    rows.value = await api<AuditRow[]>('/audit');
  } finally {
    loading.value = false;
  }
});

useSeoMeta({ title: 'Audit log' });
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold tracking-tight">Audit log</h1>
    <p class="text-sm text-muted-foreground">
      Every platform action, recorded in the admin database (never reachable by the app).
    </p>

    <Card>
      <CardContent class="p-0">
        <p v-if="loading" class="p-6 text-muted-foreground">Loading…</p>
        <p v-else-if="!rows.length" class="p-6 text-muted-foreground">No actions recorded yet.</p>
        <div v-else class="divide-y">
          <div
            v-for="r in rows"
            :key="r.id"
            class="flex items-center justify-between px-6 py-3"
            data-testid="audit-row"
          >
            <div>
              <div class="font-medium">{{ r.action }}</div>
              <div class="font-mono text-xs text-muted-foreground">
                {{ r.targetType }} · {{ r.targetId.slice(0, 8) }}
              </div>
            </div>
            <div class="text-sm text-muted-foreground">{{ new Date(r.at).toLocaleString() }}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
