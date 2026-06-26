<script setup lang="ts">
import { Moon, Sun } from 'lucide-vue-next';

const { isDark, sync, toggle } = useTheme();
onMounted(sync);
</script>

<template>
  <button
    type="button"
    aria-label="Toggle light or dark theme"
    class="inline-flex h-9 w-9 items-center justify-center rounded-md opacity-60 transition-opacity hover:opacity-100"
    @click="toggle"
  >
    <ClientOnly>
      <component :is="isDark ? Sun : Moon" class="h-4 w-4" />
      <template #fallback><Moon class="h-4 w-4" /></template>
    </ClientOnly>
  </button>
</template>
