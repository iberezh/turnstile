<script setup lang="ts">
// "Reveal" footer: on desktop the footer is fixed behind the (opaque) content, and the content
// carries a bottom margin equal to the footer height — so scrolling to the end lifts the content
// up and uncovers the footer. On small screens it's a normal in-flow footer (a fixed footer taller
// than the viewport can't be scrolled into).
const footer = ref<HTMLElement | null>(null);
const reveal = ref(false);
const gap = ref(0);

function sync() {
  if (!import.meta.client) return;
  reveal.value = window.innerWidth >= 1024;
  gap.value = reveal.value && footer.value ? footer.value.offsetHeight : 0;
}
onMounted(() => {
  nextTick(sync);
  window.addEventListener('resize', sync);
});
onBeforeUnmount(() => window.removeEventListener('resize', sync));
</script>

<template>
  <div class="min-h-screen">
    <SiteHeader />
    <div class="relative z-10 bg-background" :style="gap ? { marginBottom: `${gap}px` } : {}">
      <main>
        <slot />
      </main>
    </div>
    <footer
      ref="footer"
      data-footer
      style="background-color: hsl(var(--footer)); color: hsl(var(--footer-foreground) / 0.82)"
      :class="reveal ? 'fixed inset-x-0 bottom-0 z-0' : 'relative z-10'"
    >
      <SiteFooter />
    </footer>
  </div>
</template>
