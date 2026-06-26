<script setup lang="ts">
import type { DashboardOrg } from '~/types/auth';

definePageMeta({ layout: 'dashboard', middleware: 'auth' });

const { public: cfg } = useRuntimeConfig();
const base = cfg.apiBase;

const orgs = ref<DashboardOrg[]>([]);
const loading = ref(true);

async function load() {
  loading.value = true;
  try {
    orgs.value = await $fetch<DashboardOrg[]>(`${base}/orgs`, { credentials: 'include' });
  } finally {
    loading.value = false;
  }
}
onMounted(load);

const name = ref('');
const slug = ref('');
const creating = ref(false);
const error = ref('');

async function createOrg() {
  error.value = '';
  creating.value = true;
  try {
    await $fetch(`${base}/orgs`, {
      method: 'POST',
      credentials: 'include',
      body: { name: name.value, slug: slug.value },
    });
    name.value = '';
    slug.value = '';
    await load();
  } catch {
    error.value = 'Could not create it — name needs 2+ characters and the slug must be unique.';
  } finally {
    creating.value = false;
  }
}

useSeoMeta({ title: 'Dashboard' });
</script>

<template>
  <div class="space-y-8">
    <div>
      <h1 class="text-2xl font-bold tracking-tight">Your organizations</h1>
      <p class="text-muted-foreground">Create an organization to start running events.</p>
    </div>

    <Card class="max-w-md">
      <CardHeader>
        <CardTitle class="text-base">New organization</CardTitle>
      </CardHeader>
      <CardContent>
        <form class="space-y-4" @submit.prevent="createOrg">
          <div class="space-y-1.5">
            <Label for="org-name">Name</Label>
            <Input id="org-name" v-model="name" required />
          </div>
          <div class="space-y-1.5">
            <Label for="org-slug">Slug</Label>
            <Input id="org-slug" v-model="slug" placeholder="acme-events" required />
          </div>
          <p v-if="error" class="text-sm text-destructive">{{ error }}</p>
          <Button type="submit" data-testid="create-org" :disabled="creating">
            {{ creating ? 'Creating…' : 'Create' }}
          </Button>
        </form>
      </CardContent>
    </Card>

    <div>
      <p v-if="loading" class="text-muted-foreground">Loading…</p>
      <p v-else-if="!orgs.length" class="text-muted-foreground">No organizations yet.</p>
      <div v-else class="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(240px,1fr))]">
        <Card v-for="o in orgs" :key="o.id" data-testid="org-card">
          <CardHeader>
            <CardTitle class="text-base">{{ o.name }}</CardTitle>
            <CardDescription>/{{ o.slug }}</CardDescription>
          </CardHeader>
          <CardContent v-if="o.role">
            <Badge variant="secondary">{{ o.role }}</Badge>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>
