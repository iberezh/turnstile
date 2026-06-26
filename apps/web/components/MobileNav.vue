<script setup lang="ts">
import { Menu, X } from 'lucide-vue-next';

// Small-screen menu: the desktop text links collapse into a hamburger that opens a sheet. Closes
// itself on navigation. Teleported to <body> so it sits above the fixed header and reveal footer.
defineProps<{ scrolled: boolean }>();
const open = ref(false);
const route = useRoute();
watch(() => route.fullPath, () => { open.value = false; });
</script>

<template>
  <div class="sm:hidden">
    <button
      type="button"
      :aria-expanded="open"
      aria-label="Open menu"
      class="flex h-9 w-9 items-center justify-center rounded-full transition-colors"
      :class="scrolled ? 'text-background hover:bg-background/20' : 'text-foreground hover:bg-secondary'"
      @click="open = !open"
    >
      <component :is="open ? X : Menu" class="h-5 w-5" />
    </button>
    <Teleport to="body">
      <div v-if="open" class="fixed inset-0 z-[60] bg-foreground/20 backdrop-blur-sm" @click="open = false">
        <nav
          class="absolute inset-x-3 top-3 rounded-2xl border bg-popover p-2 text-popover-foreground shadow-2xl"
          @click.stop
        >
          <NuxtLink
            v-for="l in publicNavLinks"
            :key="l.to"
            :to="l.to"
            class="block rounded-lg px-4 py-3 font-display text-sm font-semibold transition-colors hover:bg-muted"
          >
            {{ l.label }}
          </NuxtLink>
          <NuxtLink
            to="/dashboard"
            class="mt-1 block rounded-lg bg-primary px-4 py-3 text-center font-display text-sm font-semibold text-primary-foreground"
          >
            Sell tickets
          </NuxtLink>
        </nav>
      </div>
    </Teleport>
  </div>
</template>
