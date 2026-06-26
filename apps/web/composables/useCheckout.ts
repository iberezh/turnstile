import type { CheckoutResult, PaidOrder, ReserveItem, ReserveResult } from '~/types/checkout';

export type CheckoutStep = 'select' | 'pay' | 'done';

// Extract the API's `{ error }` message from a $fetch failure, falling back to a friendly default.
function apiMessage(e: unknown, fallback: string): string {
  if (e && typeof e === 'object' && 'data' in e) {
    const data = (e as { data?: unknown }).data;
    if (data && typeof data === 'object' && 'error' in data) {
      const msg = (data as { error?: unknown }).error;
      if (typeof msg === 'string') return msg;
    }
  }
  return fallback;
}

// Drives the buyer's reserve → pay → confirmed flow for one event. Calls carry credentials, so a
// signed-in buyer's order is linked to their account (and shows up in /tickets).
export function useCheckout(slug: string) {
  const api = useApi();
  const step = ref<CheckoutStep>('select');
  const hold = ref<ReserveResult | null>(null);
  const order = ref<PaidOrder | null>(null);
  const pending = ref(false);
  const error = ref('');

  async function reserve(items: ReserveItem[]): Promise<void> {
    error.value = '';
    pending.value = true;
    try {
      hold.value = await api<ReserveResult>(`/events/${slug}/reserve`, {
        method: 'POST',
        body: { items },
      });
      step.value = 'pay';
    } catch (e) {
      error.value = apiMessage(e, 'Those tickets are no longer available.');
    } finally {
      pending.value = false;
    }
  }

  async function pay(buyerEmail: string, promoCode: string): Promise<void> {
    if (!hold.value) return;
    error.value = '';
    pending.value = true;
    const code = promoCode.trim();
    try {
      const result = await api<CheckoutResult>(`/events/${slug}/checkout`, {
        method: 'POST',
        body: code
          ? { holdId: hold.value.holdId, buyerEmail, promoCode: code }
          : { holdId: hold.value.holdId, buyerEmail },
      });
      if (result.status === 'paid') {
        order.value = result;
        step.value = 'done';
      } else {
        error.value = 'Card payment isn’t available in this demo yet.';
      }
    } catch (e) {
      error.value = apiMessage(e, 'Payment could not be completed.');
    } finally {
      pending.value = false;
    }
  }

  function reset(): void {
    step.value = 'select';
    hold.value = null;
    order.value = null;
    error.value = '';
  }

  return { step, hold, order, pending, error, reserve, pay, reset };
}
