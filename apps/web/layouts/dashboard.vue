<script setup lang="ts">
const { user, logout } = useAuth();

async function signOut() {
  await logout();
  await navigateTo('/login');
}
</script>

<template>
  <div class="min-h-screen">
    <header class="border-b">
      <div class="container flex items-center justify-between py-3">
        <div class="flex items-center gap-6">
          <NuxtLink to="/dashboard" aria-label="Turnstile dashboard"><Logo /></NuxtLink>
          <span class="hidden text-sm text-muted-foreground sm:block">Organizer dashboard</span>
        </div>
        <div class="flex items-center gap-3">
          <span class="hidden text-sm text-muted-foreground sm:block" data-testid="who">{{ user?.email }}</span>
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
