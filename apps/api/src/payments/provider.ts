// Payments abstraction so the app depends on an interface, not Stripe directly — and so it runs
// keyless in dev/CI via the mock implementation (selected in index.ts).
export interface AccountStatus {
  chargesEnabled: boolean;
}

export interface PaymentsProvider {
  // 'live' uses Stripe; 'mock' is the keyless fallback (onboarding is simulated).
  readonly mode: 'live' | 'mock';
  // Create a Connect (Express) account for an organizer; returns the account id.
  createConnectAccount(email: string): Promise<string>;
  // Hosted onboarding/KYC link the organizer completes.
  createAccountLink(accountId: string, returnUrl: string, refreshUrl: string): Promise<string>;
  // Live status from the provider (used to refresh the cached charges_enabled flag).
  getAccountStatus(accountId: string): Promise<AccountStatus>;
}
