// Buyer-side shapes for the reserve → pay flow and the "My tickets" wallet. Dates arrive as ISO
// strings over JSON.
export interface ReserveItem {
  ticketTypeId: string;
  quantity: number;
}

export interface ReserveResult {
  holdId: string;
  expiresAt: string;
  items: ReserveItem[];
}

export interface PaidOrder {
  status: 'paid';
  orderId: string;
  amountCents: number;
  discountCents: number;
  pointsEarned: number;
  feeCents: number;
  currency: string;
  tickets: string[];
}

export interface RequiresPayment {
  status: 'requires_payment';
  paymentIntentId: string;
  clientSecret: string;
  amountCents: number;
  discountCents: number;
  feeCents: number;
}

export type CheckoutResult = PaidOrder | RequiresPayment;

export interface WalletTicket {
  id: string;
  eventTitle: string;
  eventSlug: string;
  startsAt: string;
  timezone: string;
  status: string;
  token: string;
  orderId: string;
}
