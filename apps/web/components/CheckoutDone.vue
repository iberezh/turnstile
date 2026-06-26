<script setup lang="ts">
import type { PaidOrder } from '~/types/checkout';

defineProps<{ order: PaidOrder; loggedIn: boolean }>();
const emit = defineEmits<{ again: [] }>();
</script>

<template>
  <div class="space-y-5 text-center">
    <div>
      <p class="font-display text-2xl font-semibold tracking-tight">You're in 🎟️</p>
      <p class="mt-1 text-sm text-muted-foreground">
        {{ order.tickets.length }} ticket{{ order.tickets.length === 1 ? '' : 's' }} ·
        {{ formatMoney(order.amountCents, order.currency) }} paid<span v-if="order.discountCents > 0">
          · {{ formatMoney(order.discountCents, order.currency) }} off</span>
      </p>
    </div>

    <div class="grid gap-3" :class="order.tickets.length > 1 ? 'sm:grid-cols-2' : ''">
      <TicketQr v-for="(t, i) in order.tickets" :key="t" :token="t" :label="`Ticket ${i + 1}`" />
    </div>
    <p class="text-xs text-muted-foreground">Show a QR at the door to walk right in.</p>

    <div class="flex items-center justify-center gap-4 pt-1">
      <NuxtLink
        v-if="loggedIn"
        to="/tickets"
        class="rounded-lg bg-primary px-5 py-2.5 font-display text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
      >
        View my tickets
      </NuxtLink>
      <button
        type="button"
        class="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        @click="emit('again')"
      >
        Buy more
      </button>
    </div>
    <p v-if="!loggedIn" class="text-xs text-muted-foreground">
      <NuxtLink to="/login" class="text-primary underline-offset-4 hover:underline">Sign in</NuxtLink>
      next time to keep every ticket in one place.
    </p>
  </div>
</template>
