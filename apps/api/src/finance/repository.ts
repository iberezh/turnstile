import { db } from '../db/client.js';

// One reconciled line per currency. gross/discount/fee are over paid orders; refunded* are over
// refunded ones. A full refund reverses both the transfer and the application fee, so:
//   organizer net   = paid(amount - fee)     - refunded(amount - fee)
//   platform income = paid(fee)              - refunded(fee)
interface Totals {
  currency: string;
  paidOrders: number;
  refundedOrders: number;
  grossCents: number;
  discountCents: number;
  feeCents: number;
  refundedCents: number;
  refundedFeeCents: number;
}

export interface FinanceSummary extends Totals {
  netCents: number;
  platformFeeCents: number;
}

export interface EventFinance extends FinanceSummary {
  eventId: string;
  title: string;
}

const n = (v: string | number | bigint | null): number => (v === null ? 0 : Number(v));

function derive<T extends Totals>(t: T): T & { netCents: number; platformFeeCents: number } {
  return {
    ...t,
    netCents: t.grossCents - t.feeCents - (t.refundedCents - t.refundedFeeCents),
    platformFeeCents: t.feeCents - t.refundedFeeCents,
  };
}

// Per-event, per-currency aggregates. Conditional sums via Kysely's filterWhere so the query
// stays type-checked against the schema (no raw SQL to drift). Postgres returns sums as strings
// (bigint) and as null when no rows match — coerced by n().
async function eventTotals(
  orgId: string,
): Promise<Array<Totals & { eventId: string; title: string }>> {
  const rows = await db
    .selectFrom('orders as o')
    .innerJoin('events as e', 'e.id', 'o.event_id')
    .where('o.org_id', '=', orgId)
    .groupBy(['o.event_id', 'e.title', 'o.currency'])
    .orderBy('e.title')
    .select((eb) => [
      'o.event_id as eventId',
      'e.title as title',
      'o.currency as currency',
      eb.fn.countAll<string>().filterWhere('o.status', '=', 'paid').as('paidOrders'),
      eb.fn.countAll<string>().filterWhere('o.status', '=', 'refunded').as('refundedOrders'),
      eb.fn
        .sum<string | null>('o.amount_cents')
        .filterWhere('o.status', '=', 'paid')
        .as('grossCents'),
      eb.fn
        .sum<string | null>('o.discount_cents')
        .filterWhere('o.status', '=', 'paid')
        .as('discountCents'),
      eb.fn.sum<string | null>('o.fee_cents').filterWhere('o.status', '=', 'paid').as('feeCents'),
      eb.fn
        .sum<string | null>('o.amount_cents')
        .filterWhere('o.status', '=', 'refunded')
        .as('refundedCents'),
      eb.fn
        .sum<string | null>('o.fee_cents')
        .filterWhere('o.status', '=', 'refunded')
        .as('refundedFeeCents'),
    ])
    .execute();

  return rows.map((r) => ({
    eventId: r.eventId,
    title: r.title,
    currency: r.currency,
    paidOrders: n(r.paidOrders),
    refundedOrders: n(r.refundedOrders),
    grossCents: n(r.grossCents),
    discountCents: n(r.discountCents),
    feeCents: n(r.feeCents),
    refundedCents: n(r.refundedCents),
    refundedFeeCents: n(r.refundedFeeCents),
  }));
}

export async function orgFinance(
  orgId: string,
): Promise<{ summary: FinanceSummary[]; events: EventFinance[] }> {
  const rows = await eventTotals(orgId);
  // Roll the per-event rows up into per-currency org totals (the components are additive).
  const byCurrency = new Map<string, Totals>();
  for (const r of rows) {
    const acc = byCurrency.get(r.currency) ?? {
      currency: r.currency,
      paidOrders: 0,
      refundedOrders: 0,
      grossCents: 0,
      discountCents: 0,
      feeCents: 0,
      refundedCents: 0,
      refundedFeeCents: 0,
    };
    acc.paidOrders += r.paidOrders;
    acc.refundedOrders += r.refundedOrders;
    acc.grossCents += r.grossCents;
    acc.discountCents += r.discountCents;
    acc.feeCents += r.feeCents;
    acc.refundedCents += r.refundedCents;
    acc.refundedFeeCents += r.refundedFeeCents;
    byCurrency.set(r.currency, acc);
  }
  return {
    summary: [...byCurrency.values()].map(derive),
    events: rows.map((r) => derive(r)),
  };
}
