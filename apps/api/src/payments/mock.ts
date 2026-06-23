import { randomUUID } from 'node:crypto';
import type {
  AccountStatus,
  CreateIntentInput,
  PaymentIntentResult,
  PaymentsProvider,
} from './provider.js';

// Keyless fallback. Onboarding is "completed" out of band via the dev-only mock-complete route,
// which flips the org's cached charges_enabled — so the whole flow is exercisable without Stripe.
export class MockPayments implements PaymentsProvider {
  readonly mode = 'mock' as const;

  async createConnectAccount(_email: string): Promise<string> {
    return `acct_mock_${randomUUID().replace(/-/g, '').slice(0, 16)}`;
  }

  async createAccountLink(_accountId: string, returnUrl: string): Promise<string> {
    // Point straight back to the app; the org "completes" via the mock-complete route.
    return `${returnUrl}?mock=1`;
  }

  async getAccountStatus(_accountId: string): Promise<AccountStatus> {
    // In mock mode the source of truth is the org's stored flag, read in the status route.
    return { chargesEnabled: false };
  }

  async createPaymentIntent(_input: CreateIntentInput): Promise<PaymentIntentResult> {
    // Auto-confirms so checkout fulfils immediately (no card flow in keyless dev).
    const id = `pi_mock_${randomUUID().replace(/-/g, '').slice(0, 16)}`;
    return { id, clientSecret: `${id}_secret_mock`, status: 'succeeded' };
  }

  async refund(_paymentIntentId: string): Promise<void> {
    // No-op; the order/tickets/inventory are reverted by the caller.
  }
}
