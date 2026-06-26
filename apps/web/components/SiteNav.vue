<script setup lang="ts">
// The navigation cluster shared by both header states (top bar and floating pill). `scrolled` only
// flips colors so it reads on the dark pill vs. the transparent bar.
defineProps<{ scrolled: boolean }>();
</script>

<template>
  <nav class="flex items-center gap-1 text-sm font-medium sm:gap-2">
    <NuxtLink
      v-for="l in publicNavLinks"
      :key="l.to"
      :to="l.to"
      class="hidden rounded-md px-3 py-2 transition-colors sm:block"
      :class="scrolled ? 'text-background/75 hover:text-background' : 'text-foreground/70 hover:text-foreground'"
    >
      {{ l.label }}
    </NuxtLink>
    <NuxtLink
      to="/dashboard"
      class="hidden rounded-full px-4 py-2 font-semibold transition-colors sm:block"
      :class="scrolled ? 'bg-sun text-sun-foreground' : 'bg-primary text-primary-foreground hover:bg-primary/90'"
    >
      Sell tickets
    </NuxtLink>
    <SiteSearch :scrolled="scrolled" />
    <AccountMenu :scrolled="scrolled" />
    <ThemeToggle />
    <MobileNav :scrolled="scrolled" />
  </nav>
</template>
