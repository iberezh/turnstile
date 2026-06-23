import { randomUUID } from 'node:crypto';
import type { AccountStatus, PaymentsProvider } from './provider.js';

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
}
