<script setup lang="ts">
withDefaults(defineProps<{ wordmark?: boolean }>(), { wordmark: true });
</script>

<template>
  <span class="inline-flex items-center gap-2.5">
    <TurnstileMark class="h-7 w-7 shrink-0" />
    <span v-if="wordmark" class="font-display text-[1.35rem] font-extrabold leading-none tracking-tight">
      Turnstile
    </span>
  </span>
</template>
