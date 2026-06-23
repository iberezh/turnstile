import Stripe from 'stripe';
import type {
  AccountStatus,
  CreateIntentInput,
  PaymentIntentResult,
  PaymentsProvider,
} from './provider.js';

// Real Stripe Connect (Express). Destination charges in P2c route funds to this account and keep
// the platform take-rate as an application fee.
export class StripePayments implements PaymentsProvider {
  readonly mode = 'live' as const;
  private readonly stripe: Stripe;

  constructor(secretKey: string) {
    this.stripe = new Stripe(secretKey);
  }

  async createConnectAccount(email: string): Promise<string> {
    const account = await this.stripe.accounts.create({ type: 'express', email });
    return account.id;
  }

  async createAccountLink(
    accountId: string,
    returnUrl: string,
    refreshUrl: string,
  ): Promise<string> {
    const link = await this.stripe.accountLinks.create({
      account: accountId,
      return_url: returnUrl,
      refresh_url: refreshUrl,
      type: 'account_onboarding',
    });
    return link.url;
  }

  async getAccountStatus(accountId: string): Promise<AccountStatus> {
    const account = await this.stripe.accounts.retrieve(accountId);
    return { chargesEnabled: account.charges_enabled ?? false };
  }

  async createPaymentIntent(input: CreateIntentInput): Promise<PaymentIntentResult> {
    const pi = await this.stripe.paymentIntents.create({
      amount: input.amountCents,
      currency: input.currency,
      application_fee_amount: input.applicationFeeCents,
      transfer_data: { destination: input.destinationAccountId },
      metadata: input.metadata,
      automatic_payment_methods: { enabled: true },
    });
    return {
      id: pi.id,
      clientSecret: pi.client_secret,
      status: pi.status === 'succeeded' ? 'succeeded' : 'requires_payment_method',
    };
  }

  async refund(paymentIntentId: string): Promise<void> {
    await this.stripe.refunds.create({
      payment_intent: paymentIntentId,
      refund_application_fee: true,
      reverse_transfer: true,
    });
  }
}
