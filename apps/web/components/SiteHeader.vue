<script setup lang="ts">
// Public site header: a full-width transparent bar over the hero that, on scroll, crossfades into a
// centered floating pill sized to its contents. The bar and pill are separate layers that swap via
// <Transition>, so each one fades + slides as it appears/disappears (a width morph can't animate to
// the pill's content-based width). The dashboard uses its own header.
const scrolled = ref(false);
const onScroll = () => {
  scrolled.value = window.scrollY > 24;
};
onMounted(() => {
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
});
onBeforeUnmount(() => window.removeEventListener('scroll', onScroll));
</script>

<template>
  <div class="fixed inset-x-0 top-0 z-40">
    <Transition name="bar">
      <div v-if="!scrolled" class="absolute inset-x-0 top-0">
        <div class="container flex h-16 items-center justify-between">
          <NuxtLink to="/" aria-label="Turnstile home" class="inline-flex items-center gap-2.5">
            <ChevronMark class="h-6 w-6 shrink-0 text-primary" />
            <span class="font-display text-xl font-semibold lowercase tracking-tight text-foreground">
              turnstile
            </span>
          </NuxtLink>
          <SiteNav :scrolled="false" />
        </div>
      </div>
    </Transition>

    <Transition name="pill">
      <div v-if="scrolled" class="absolute inset-x-0 top-0 flex justify-center px-4 pt-3">
        <div
          class="flex items-center gap-5 rounded-full border border-white/10 bg-foreground px-5 py-2 text-background shadow-xl shadow-foreground/20"
        >
          <NuxtLink to="/" aria-label="Turnstile home" class="inline-flex items-center">
            <ChevronMark class="h-6 w-6 shrink-0 text-background" />
          </NuxtLink>
          <SiteNav :scrolled="true" />
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.bar-enter-active,
.bar-leave-active,
.pill-enter-active,
.pill-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.bar-enter-from,
.bar-leave-to {
  opacity: 0;
  transform: translateY(-0.5rem);
}
.pill-enter-from,
.pill-leave-to {
  opacity: 0;
  transform: translateY(-0.75rem) scale(0.96);
}
@media (prefers-reduced-motion: reduce) {
  .bar-enter-active,
  .bar-leave-active,
  .pill-enter-active,
  .pill-leave-active {
    transition: none;
  }
}
</style>
