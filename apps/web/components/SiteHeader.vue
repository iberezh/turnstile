<script setup lang="ts">
// Public site header in the "Wolverine" pattern: a transparent full-width bar over the hero that
// condenses into a floating pill on scroll — one element morphing (bg sweeps in, corners round, it
// shrinks and lifts). The pill rests at its natural content width (roomy, never clipped); to still
// animate the width — which CSS can't do to/from an auto width — we measure the before/after widths
// and tween them with the Web Animations API, with a gentle ease so the start isn't abrupt. The
// background, radius, padding and shadow morph via the CSS transition alongside it.
const scrolled = ref(false);
const shell = ref<HTMLElement | null>(null);
let anim: Animation | undefined;

function morph(next: boolean): void {
  const el = shell.value;
  if (!el) {
    scrolled.value = next;
    return;
  }
  const from = el.getBoundingClientRect().width;
  scrolled.value = next;
  nextTick(() => {
    const to = el.getBoundingClientRect().width;
    if (Math.abs(from - to) < 1) return;
    anim?.cancel();
    anim = el.animate([{ width: `${from}px` }, { width: `${to}px` }], {
      duration: 320,
      easing: 'cubic-bezier(0.65, 0, 0.35, 1)',
    });
  });
}

const onScroll = () => {
  const next = window.scrollY > 24;
  if (next !== scrolled.value) morph(next);
};
onMounted(() => {
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
});
onBeforeUnmount(() => window.removeEventListener('scroll', onScroll));
</script>

<template>
  <div
    class="fixed inset-x-0 top-0 z-40 flex justify-center transition-all duration-300"
    :class="scrolled ? 'px-4 pt-3' : 'px-0 pt-0'"
  >
    <div
      ref="shell"
      class="flex items-center transition-[background-color,border-color,border-radius,box-shadow,color,padding] duration-300 ease-[cubic-bezier(0.65,0,0.35,1)]"
      :class="
        scrolled
          ? 'gap-5 rounded-full border border-white/10 bg-foreground px-5 py-2 text-background shadow-xl shadow-foreground/20'
          : 'container h-16 justify-between'
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
      <SiteNav :scrolled="scrolled" />
    </div>
  </div>
</template>
