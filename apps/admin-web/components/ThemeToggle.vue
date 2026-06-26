<script setup lang="ts">
import { Moon, Sun } from 'lucide-vue-next';

const { isDark, sync, toggle } = useTheme();
onMounted(sync);
</script>

<template>
  <button
    type="button"
    aria-label="Toggle light or dark theme"
    class="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
    @click="toggle"
  >
    <ClientOnly>
      <component :is="isDark ? Sun : Moon" class="h-4 w-4" />
      <template #fallback><Moon class="h-4 w-4" /></template>
    </ClientOnly>
  </button>
</template>
