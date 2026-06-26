<script setup lang="ts">
import { Minus, Plus } from 'lucide-vue-next';
import type { TicketTypeDto } from '~/types/event';

const props = defineProps<{ slug: string; tiers: TicketTypeDto[] }>();
const { step, pending, error, order, reserve, pay, reset } = useCheckout(props.slug);
const { user } = useAuth();

const quantities = reactive<Record<string, number>>(Object.fromEntries(props.tiers.map((t) => [t.id, 0])));
const buyerEmail = ref('');
const promoCode = ref('');

watch(user, (u) => { if (u?.email && !buyerEmail.value) buyerEmail.value = u.email; }, { immediate: true });

const currency = computed(() => props.tiers[0]?.currency ?? 'usd');
const totalQty = computed(() => Object.values(quantities).reduce((a, b) => a + b, 0));
const subtotalCents = computed(() =>
  props.tiers.reduce((sum, t) => sum + t.priceCents * (quantities[t.id] ?? 0), 0),
);
const chosen = computed(() => props.tiers.filter((t) => (quantities[t.id] ?? 0) > 0));

function adjust(id: string, delta: number): void {
  quantities[id] = Math.max(0, Math.min(10, (quantities[id] ?? 0) + delta));
}
function startReserve(): void {
  reserve(chosen.value.map((t) => ({ ticketTypeId: t.id, quantity: quantities[t.id] ?? 0 })));
}
function buyAgain(): void {
  for (const t of props.tiers) quantities[t.id] = 0;
  promoCode.value = '';
  reset();
}
</script>

<template>
  <Card>
    <CardContent class="space-y-4 p-5 sm:p-6">
      <CheckoutDone v-if="step === 'done' && order" :order="order" :logged-in="!!user" @again="buyAgain" />

      <template v-else-if="step === 'pay'">
        <div>
          <p class="font-display text-lg font-semibold tracking-tight">Almost there</p>
          <ul class="mt-2 space-y-1 text-sm text-muted-foreground">
            <li v-for="t in chosen" :key="t.id" class="flex justify-between">
              <span>{{ quantities[t.id] }} × {{ t.name }}</span>
              <span class="tabular-nums">{{ formatMoney(t.priceCents * (quantities[t.id] ?? 0), currency) }}</span>
            </li>
          </ul>
        </div>
        <div class="space-y-1.5">
          <Label for="buyer-email">Email</Label>
          <Input id="buyer-email" v-model="buyerEmail" type="email" autocomplete="email" placeholder="you@example.com" />
          <p class="text-xs text-muted-foreground">Your tickets and QR codes go here.</p>
        </div>
        <div class="space-y-1.5">
          <Label for="promo">Promo code <span class="text-muted-foreground">(optional)</span></Label>
          <Input id="promo" v-model="promoCode" placeholder="SAVE10" />
        </div>
        <p v-if="error" class="text-sm text-destructive" data-testid="checkout-error">{{ error }}</p>
        <div class="flex items-center justify-between pt-1">
          <button type="button" class="text-sm text-muted-foreground hover:text-foreground" @click="reset">← Back</button>
          <Button :disabled="pending || !buyerEmail" @click="pay(buyerEmail, promoCode)">
            {{ pending ? 'Processing…' : `Pay ${formatMoney(subtotalCents, currency)}` }}
          </Button>
        </div>
      </template>

      <template v-else>
        <p class="font-display text-lg font-semibold tracking-tight">Get tickets</p>
        <div class="divide-y">
          <div v-for="t in tiers" :key="t.id" class="flex items-center justify-between gap-3 py-3">
            <div>
              <p class="font-medium">{{ t.name }}</p>
              <p class="font-display text-sm font-semibold tabular-nums text-primary">
                {{ formatMoney(t.priceCents, t.currency) }}
              </p>
            </div>
            <div class="flex items-center gap-3">
              <button
                type="button"
                class="flex h-8 w-8 items-center justify-center rounded-full border text-muted-foreground transition-colors hover:bg-muted disabled:opacity-40"
                :disabled="(quantities[t.id] ?? 0) === 0"
                :aria-label="`Remove one ${t.name}`"
                @click="adjust(t.id, -1)"
              >
                <Minus class="h-4 w-4" />
              </button>
              <span class="w-5 text-center font-display font-semibold tabular-nums">{{ quantities[t.id] ?? 0 }}</span>
              <button
                type="button"
                class="flex h-8 w-8 items-center justify-center rounded-full border text-muted-foreground transition-colors hover:bg-muted"
                :aria-label="`Add one ${t.name}`"
                @click="adjust(t.id, 1)"
              >
                <Plus class="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
        <p v-if="error" class="text-sm text-destructive" data-testid="checkout-error">{{ error }}</p>
        <div class="flex items-center justify-between pt-1">
          <span class="text-sm text-muted-foreground">
            Subtotal <span class="font-display font-semibold tabular-nums text-foreground">{{ formatMoney(subtotalCents, currency) }}</span>
          </span>
          <Button :disabled="totalQty === 0 || pending" @click="startReserve">
            {{ pending ? 'Reserving…' : 'Continue' }}
          </Button>
        </div>
      </template>
    </CardContent>
  </Card>
</template>
