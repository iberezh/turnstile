<script setup lang="ts">
// Public site header in the "Wolverine" pattern: a transparent full-width bar over the hero at the
// top, condensing into a floating pill once you scroll. The dashboard uses its own header.
const scrolled = ref(false);
const onScroll = () => {
  scrolled.value = window.scrollY > 24;
};
onMounted(() => {
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
});
onBeforeUnmount(() => window.removeEventListener('scroll', onScroll));

const links = [
  { label: "What's on", to: '/#whats-on' },
  { label: 'Organizers', to: '/dashboard' },
];
</script>

<template>
  <div
    class="fixed inset-x-0 top-0 z-40 flex justify-center transition-all duration-300"
    :class="scrolled ? 'px-4 pt-3' : 'px-0 pt-0'"
  >
    <div
      class="flex items-center justify-between gap-3 transition-all duration-300"
      :class="
        scrolled
          ? 'w-full max-w-3xl rounded-full border border-white/10 bg-foreground px-4 py-2 text-background shadow-xl shadow-foreground/20'
          : 'container h-16'
      "
    >
      <NuxtLink to="/" aria-label="Turnstile home" class="inline-flex items-center gap-2.5">
        <ChevronMark class="h-6 w-6 shrink-0" :class="scrolled ? 'text-background' : 'text-primary'" />
        <span
          v-if="!scrolled"
          class="font-display text-xl font-semibold lowercase tracking-tight text-foreground"
        >
          turnstile
        </span>
      </NuxtLink>

      <nav class="flex items-center gap-1 text-sm font-medium sm:gap-2">
        <NuxtLink
          v-for="l in links"
          :key="l.to"
          :to="l.to"
          class="hidden rounded-md px-3 py-2 transition-colors sm:block"
          :class="scrolled ? 'text-background/75 hover:text-background' : 'text-foreground/70 hover:text-foreground'"
        >
          {{ l.label }}
        </NuxtLink>
        <NuxtLink
          to="/dashboard"
          class="rounded-full px-4 py-2 font-semibold transition-colors"
          :class="scrolled ? 'bg-sun text-sun-foreground' : 'bg-primary text-primary-foreground hover:bg-primary/90'"
        >
          Sell tickets
        </NuxtLink>
        <AccountMenu :scrolled="scrolled" />
        <ThemeToggle />
      </nav>
    </div>
  </div>
</template>
