import { sql } from 'kysely';
import { db } from '../db/client.js';
import { creditPoints } from '../loyalty/repository.js';
import { signTicket } from '../tickets/qr.js';

export interface CheckoutLine {
  ticketTypeId: string;
  quantity: number;
  priceCents: number;
}
export interface HeldHold {
  eventId: string;
  currency: string;
  amountCents: number;
  lines: CheckoutLine[];
}

// Load a still-valid hold and price it from the ticket types (server-side — the client never
// sends prices).
export async function loadHeldHold(holdId: string): Promise<HeldHold | null> {
  const rows = await db
    .selectFrom('ticket_holds')
    .innerJoin('ticket_types', 'ticket_types.id', 'ticket_holds.ticket_type_id')
    .select([
      'ticket_holds.ticket_type_id as ticketTypeId',
      'ticket_holds.quantity as quantity',
      'ticket_holds.event_id as eventId',
      'ticket_types.price_cents as priceCents',
      'ticket_types.currency as currency',
    ])
    .where('ticket_holds.hold_id', '=', holdId)
    .where('ticket_holds.status', '=', 'held')
    .where('ticket_holds.expires_at', '>', new Date())
    .execute();
  const first = rows[0];
  if (!first) return null;
  const amountCents = rows.reduce((sum, r) => sum + r.priceCents * r.quantity, 0);
  return {
    eventId: first.eventId,
    currency: first.currency,
    amountCents,
    lines: rows.map((r) => ({
      ticketTypeId: r.ticketTypeId,
      quantity: r.quantity,
      priceCents: r.priceCents,
    })),
  };
}

export interface FulfilInput {
  holdId: string;
  eventId: string;
  orgId: string;
  buyerEmail: string;
  paymentIntentId: string;
  amountCents: number;
  feeCents: number;
  discountCents: number;
  promoCodeId?: string | undefined;
  pointsEarned: number;
  partnerId?: string | undefined;
  userId?: string | undefined;
  currency: string;
  lines: { ticketTypeId: string; quantity: number }[];
}
export interface FulfilResult {
  orderId: string;
  ticketTokens: string[];
}

// Thrown inside the fulfilment transaction to force a rollback when a claim (promo cap, points
// balance) loses a race after we've already started writing. Caught below and surfaced as null.
class Unfulfillable extends Error {}

// Convert a paid hold into an order + issued tickets. Idempotent (one order per payment) and
// row-locked, so a webhook re-delivery or a double-submit can't double-issue. The hold's seats
// stay reserved — they just move from 'held' to 'converted'.
export async function fulfilOrder(input: FulfilInput): Promise<FulfilResult | null> {
  try {
    return await db.transaction().execute(async (trx) => {
      const existing = await trx
        .selectFrom('orders')
        .select('id')
        .where('payment_intent_id', '=', input.paymentIntentId)
        .executeTakeFirst();
      if (existing) return null; // idempotent replay — nothing written, safe to commit empty

      const held = await trx
        .selectFrom('ticket_holds')
        .select('id')
        .where('hold_id', '=', input.holdId)
        .where('status', '=', 'held')
        .forUpdate()
        .execute();
      if (held.length === 0) return null;

      const order = await trx
        .insertInto('orders')
        .values({
          event_id: input.eventId,
          org_id: input.orgId,
          hold_id: input.holdId,
          payment_intent_id: input.paymentIntentId,
          buyer_email: input.buyerEmail,
          amount_cents: input.amountCents,
          fee_cents: input.feeCents,
          discount_cents: input.discountCents,
          promo_code_id: input.promoCodeId ?? null,
          points_earned: input.pointsEarned,
          partner_id: input.partnerId ?? null,
          user_id: input.userId ?? null,
          currency: input.currency,
        })
        .returning('id')
        .executeTakeFirstOrThrow();

      // Claim a promo redemption under its cap — same guard as ticket inventory. A loss here (code
      // deactivated or capped since pricing) throws to roll back the order just inserted.
      if (input.promoCodeId) {
        const redeemed = await trx
          .updateTable('promo_codes')
          .set({ redeemed_count: sql<number>`redeemed_count + 1` })
          .where('id', '=', input.promoCodeId)
          .where('active', '=', true)
          .where((eb) =>
            eb.or([
              eb('max_redemptions', 'is', null),
              eb('redeemed_count', '<', eb.ref('max_redemptions')),
            ]),
          )
          .executeTakeFirst();
        if (Number(redeemed.numUpdatedRows) === 0) throw new Unfulfillable();
      }

      const ticketTokens: string[] = [];
      for (const line of input.lines) {
        for (let i = 0; i < line.quantity; i++) {
          const ticket = await trx
            .insertInto('tickets')
            .values({
              order_id: order.id,
              event_id: input.eventId,
              ticket_type_id: line.ticketTypeId,
              attendee_email: input.buyerEmail,
            })
            .returning('id')
            .executeTakeFirstOrThrow();
          ticketTokens.push(signTicket(ticket.id, input.eventId));
        }
      }

      if (input.pointsEarned > 0) {
        await creditPoints(
          trx,
          input.orgId,
          input.buyerEmail,
          order.id,
          input.pointsEarned,
          'earn',
        );
      }

      await trx
        .updateTable('ticket_holds')
        .set({ status: 'converted' })
        .where('hold_id', '=', input.holdId)
        .where('status', '=', 'held')
        .execute();
      return { orderId: order.id, ticketTokens };
    });
  } catch (e) {
    if (e instanceof Unfulfillable) return null;
    throw e;
  }
}
