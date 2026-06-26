<script setup lang="ts">
// The turnstile mark: a tripod gate seen from above, inside a ring with an entry gap.
// `spin` slowly rotates the arms — the gate turning, i.e. admission.
withDefaults(defineProps<{ spin?: boolean }>(), { spin: false });
</script>

<template>
  <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
    <circle
      cx="24"
      cy="24"
      r="20.5"
      stroke="hsl(var(--brand))"
      stroke-width="2"
      stroke-linecap="round"
      stroke-dasharray="98 31"
      transform="rotate(-58 24 24)"
      opacity="0.5"
    />
    <g :class="{ spin }" style="transform-origin: 24px 24px">
      <g stroke="url(#turnstile-grad)" stroke-width="3.6" stroke-linecap="round">
        <line x1="24" y1="24" x2="24" y2="6.5" />
        <line x1="24" y1="24" x2="39.2" y2="32.8" />
        <line x1="24" y1="24" x2="8.8" y2="32.8" />
      </g>
    </g>
    <circle cx="24" cy="24" r="4.2" fill="hsl(var(--gold))" />
    <defs>
      <linearGradient id="turnstile-grad" x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
        <stop stop-color="hsl(var(--brand))" />
        <stop offset="1" stop-color="hsl(var(--gold))" />
      </linearGradient>
    </defs>
  </svg>
</template>

<style scoped>
.spin {
  animation: turnstile-spin 14s linear infinite;
}
@keyframes turnstile-spin {
  to {
    transform: rotate(360deg);
  }
}
@media (prefers-reduced-motion: reduce) {
  .spin {
    animation: none;
  }
}
</style>
