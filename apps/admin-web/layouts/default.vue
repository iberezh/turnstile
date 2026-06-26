<script setup lang="ts">
const { admin, logout } = useAdminAuth();
const route = useRoute();

async function signOut() {
  await logout();
  await navigateTo('/login');
}
</script>

<template>
  <div v-if="route.path === '/login'">
    <slot />
  </div>
  <div v-else class="min-h-screen">
    <header class="border-b">
      <div class="container flex items-center justify-between py-3">
        <div class="flex items-center gap-6">
          <NuxtLink to="/" aria-label="Turnstile Admin home" class="inline-flex items-center gap-2.5 text-primary">
            <ChevronMark class="h-6 w-6" />
            <span class="font-display text-xl font-semibold lowercase tracking-tight text-foreground">turnstile</span>
            <span class="rounded bg-primary/10 px-1.5 py-0.5 font-display text-[0.62rem] font-semibold uppercase tracking-wide text-primary">Admin</span>
          </NuxtLink>
          <nav class="flex items-center gap-4 text-sm text-muted-foreground">
            <NuxtLink to="/" class="hover:text-foreground">Organizations</NuxtLink>
            <NuxtLink to="/audit" class="hover:text-foreground">Audit log</NuxtLink>
          </nav>
        </div>
        <div class="flex items-center gap-3">
          <span class="hidden text-sm text-muted-foreground sm:block" data-testid="who">
            {{ admin?.email }} · {{ admin?.role }}
          </span>
          <ThemeToggle />
          <Button variant="outline" size="sm" data-testid="signout" @click="signOut">Sign out</Button>
        </div>
      </div>
    </header>
    <main class="container py-8">
      <slot />
    </main>
  </div>
</template>
