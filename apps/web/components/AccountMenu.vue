<script setup lang="ts">
// Auth-aware account control for the public header. Resolves the session client-side (the API
// cookie is httpOnly, not visible to SSR) so it lives inside <ClientOnly> to avoid hydration drift.
const props = defineProps<{ scrolled: boolean }>();
const { user, refresh, logout } = useAuth();
const open = ref(false);
const root = ref<HTMLElement | null>(null);

function onDocClick(e: MouseEvent): void {
  if (root.value && !root.value.contains(e.target as Node)) open.value = false;
}
onMounted(() => {
  refresh();
  document.addEventListener('click', onDocClick);
});
onBeforeUnmount(() => document.removeEventListener('click', onDocClick));

const initial = computed(() => {
  const u = user.value;
  if (!u) return '';
  return (u.name?.trim() || u.email).charAt(0).toUpperCase();
});

async function signOut(): Promise<void> {
  await logout();
  open.value = false;
  await navigateTo('/');
}
</script>

<template>
  <ClientOnly>
    <NuxtLink
      v-if="!user"
      to="/login"
      class="hidden rounded-md px-3 py-2 transition-colors sm:block"
      :class="props.scrolled ? 'text-background/75 hover:text-background' : 'text-foreground/70 hover:text-foreground'"
    >
      Sign in
    </NuxtLink>
    <div v-else ref="root" class="relative">
      <button
        type="button"
        class="flex h-8 w-8 items-center justify-center rounded-full font-display text-sm font-semibold transition-colors"
        :class="props.scrolled ? 'bg-background/20 text-background hover:bg-background/30' : 'bg-primary/10 text-primary hover:bg-primary/20'"
        :aria-expanded="open"
        aria-haspopup="menu"
        aria-label="Account menu"
        @click="open = !open"
      >
        {{ initial }}
      </button>
      <div
        v-if="open"
        class="absolute right-0 top-11 z-50 w-48 overflow-hidden rounded-xl border bg-popover p-1 text-popover-foreground shadow-lg"
        role="menu"
      >
        <p class="truncate px-3 py-2 text-xs text-muted-foreground">{{ user.email }}</p>
        <NuxtLink to="/tickets" role="menuitem" class="block rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted" @click="open = false">
          My tickets
        </NuxtLink>
        <NuxtLink to="/dashboard" role="menuitem" class="block rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted" @click="open = false">
          Organizer
        </NuxtLink>
        <button type="button" role="menuitem" class="block w-full rounded-md px-3 py-2 text-left text-sm font-medium text-destructive transition-colors hover:bg-muted" @click="signOut">
          Sign out
        </button>
      </div>
    </div>
  </ClientOnly>
</template>
