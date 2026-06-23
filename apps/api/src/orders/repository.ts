import { sql } from 'kysely';
import { db } from '../db/client.js';

export interface OrderSummary {
  id: string;
  buyerEmail: string;
  amountCents: number;
  feeCents: number;
  currency: string;
  status: string;
  createdAt: Date;
}
export interface OrderRecord {
  id: string;
  orgId: string;
  eventId: string;
  paymentIntentId: string;
  status: string;
  amountCents: number;
  feeCents: number;
}

export async function listOrders(eventId: string): Promise<OrderSummary[]> {
  const rows = await db
    .selectFrom('orders')
    .selectAll()
    .where('event_id', '=', eventId)
    .orderBy('created_at', 'desc')
    .execute();
  return rows.map((r) => ({
    id: r.id,
    buyerEmail: r.buyer_email,
    amountCents: r.amount_cents,
    feeCents: r.fee_cents,
    currency: r.currency,
    status: r.status,
    createdAt: r.created_at,
  }));
}

export async function getOrder(orderId: string): Promise<OrderRecord | undefined> {
  const r = await db.selectFrom('orders').selectAll().where('id', '=', orderId).executeTakeFirst();
  return r
    ? {
        id: r.id,
        orgId: r.org_id,
        eventId: r.event_id,
        paymentIntentId: r.payment_intent_id,
        status: r.status,
        amountCents: r.amount_cents,
        feeCents: r.fee_cents,
      }
    : undefined;
}

// Full refund: void the order + its tickets and return their seats to inventory. Row-locked and
// idempotent — only acts on a still-'paid' order, so a double refund is a no-op (returns false).
export async function refundOrder(orderId: string): Promise<boolean> {
  return db.transaction().execute(async (trx) => {
    const order = await trx
      .selectFrom('orders')
      .select('status')
      .where('id', '=', orderId)
      .forUpdate()
      .executeTakeFirst();
    if (!order || order.status !== 'paid') return false;

    const groups = await trx
      .selectFrom('tickets')
      .select('ticket_type_id')
      .select((eb) => eb.fn.countAll<string>().as('n'))
      .where('order_id', '=', orderId)
      .groupBy('ticket_type_id')
      .execute();
    for (const g of groups) {
      await trx
        .updateTable('ticket_types')
        .set({ reserved: sql<number>`greatest(reserved - ${Number(g.n)}, 0)` })
        .where('id', '=', g.ticket_type_id)
        .execute();
    }
    await trx
      .updateTable('tickets')
      .set({ status: 'refunded' })
      .where('order_id', '=', orderId)
      .execute();
    await trx
      .updateTable('orders')
      .set({ status: 'refunded', refunded_at: new Date() })
      .where('id', '=', orderId)
      .execute();
    return true;
  });
}
