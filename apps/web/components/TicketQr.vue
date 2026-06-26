<script setup lang="ts">
import { toDataURL } from 'qrcode';

// Renders a signed ticket token as a scannable QR. The token is a self-contained signed claim of
// (ticketId, eventId) — the door scanner verifies it, so the image is all an attendee needs.
const props = defineProps<{ token: string; label?: string }>();
const src = ref('');

watchEffect(async () => {
  src.value = await toDataURL(props.token, { margin: 1, width: 320 });
});
</script>

<template>
  <div class="flex flex-col items-center gap-2 rounded-xl border bg-card p-4">
    <img v-if="src" :src="src" :alt="label ?? 'Ticket QR code'" class="h-36 w-36 rounded-lg" />
    <div v-else class="h-36 w-36 animate-pulse rounded-lg bg-muted" />
    <p v-if="label" class="font-display text-xs font-semibold uppercase tracking-wide text-muted-foreground">
      {{ label }}
    </p>
  </div>
</template>
