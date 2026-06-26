<script setup lang="ts">
// Public site header in the "Wolverine" pattern: a transparent full-width bar over the hero that
// condenses into a floating pill on scroll — one element morphing (bg sweeps in, corners round, it
// shrinks and lifts). To hug the content with no dead space *and* still animate, we measure the
// pill's exact width and bind it only when scrolled; the bar's `container` width is the other end,
// so plain CSS transitions the width both ways — no per-scroll work, no lag.
const scrolled = ref(false);
const navEl = ref<HTMLElement | null>(null);
const pillWidth = ref(0);

// nav's natural width + the pill's own fixed chrome: chevron 24 + gap-5 20 + px-5 40 + border 2.
function measure(): void {
  if (navEl.value) pillWidth.value = navEl.value.offsetWidth + 86;
}

let ro: ResizeObserver | undefined;
const onScroll = () => {
  scrolled.value = window.scrollY > 24;
};
onMounted(() => {
  measure();
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
  ro = new ResizeObserver(measure);
  if (navEl.value) ro.observe(navEl.value);
});
onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll);
  ro?.disconnect();
});
</script>

<template>
  <div
    class="fixed inset-x-0 top-0 z-40 flex justify-center transition-all duration-300"
    :class="scrolled ? 'px-4 pt-3' : 'px-0 pt-0'"
  >
    <div
      class="flex items-center transition-all duration-300"
      :class="
        scrolled
          ? 'gap-5 rounded-full border border-white/10 bg-foreground px-5 py-2 text-background shadow-xl shadow-foreground/20'
          : 'container h-16 justify-between'
      "
      :style="scrolled && pillWidth ? { width: `${pillWidth}px` } : undefined"
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

      <nav ref="navEl" class="flex items-center gap-1 text-sm font-medium sm:gap-2">
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
    </div>
  </div>
</template>
