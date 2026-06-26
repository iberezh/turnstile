<script setup lang="ts">
withDefaults(defineProps<{ wordmark?: boolean }>(), { wordmark: true });
</script>

<template>
  <span class="inline-flex items-center gap-2.5 text-primary">
    <ChevronMark class="h-6 w-6 shrink-0" />
    <span
      v-if="wordmark"
      class="font-display text-xl font-semibold lowercase tracking-tight text-foreground"
    >
      turnstile
    </span>
  </span>
</template>
