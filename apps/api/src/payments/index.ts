import { config } from '../config.js';
import { MockPayments } from './mock.js';
import type { PaymentsProvider } from './provider.js';
import { StripePayments } from './stripe.js';

// Real Stripe when a key is set; otherwise the keyless mock (the default in dev/CI).
export const payments: PaymentsProvider = config.STRIPE_SECRET_KEY
  ? new StripePayments(config.STRIPE_SECRET_KEY)
  : new MockPayments();
