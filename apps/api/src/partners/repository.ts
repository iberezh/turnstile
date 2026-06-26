import { db } from '../db/client.js';
import { commissionCents } from './commission.js';
import type { CreatePartnerInput } from './schemas.js';

export const normalizeCode = (code: string): string => code.trim().toUpperCase();

export interface Partner {
  id: string;
  code: string;
  name: string;
  commissionBps: number;
  active: boolean;
}

export interface PartnerStats extends Partner {
  attributedOrders: number;
  grossCents: number;
  refundedCents: number;
  commissionCents: number;
}

export async function findActivePartner(orgId: string, code: string): Promise<Partner | undefined> {
  const r = await db
    .selectFrom('partners')
    .select(['id', 'code', 'name', 'commission_bps', 'active'])
    .where('org_id', '=', orgId)
    .where('code', '=', normalizeCode(code))
    .where('active', '=', true)
    .executeTakeFirst();
  return r
    ? { id: r.id, code: r.code, name: r.name, commissionBps: r.commission_bps, active: r.active }
    : undefined;
}

export async function createPartner(orgId: string, input: CreatePartnerInput): Promise<Partner> {
  const r = await db
    .insertInto('partners')
    .values({
      org_id: orgId,
      code: normalizeCode(input.code),
      name: input.name,
      commission_bps: input.commissionBps,
    })
    .returning(['id', 'code', 'name', 'commission_bps', 'active'])
    .executeTakeFirstOrThrow();
  return {
    id: r.id,
    code: r.code,
    name: r.name,
    commissionBps: r.commission_bps,
    active: r.active,
  };
}

export async function findPartnerByCode(
  orgId: string,
  code: string,
): Promise<{ id: string } | undefined> {
  return db
    .selectFrom('partners')
    .select('id')
    .where('org_id', '=', orgId)
    .where('code', '=', normalizeCode(code))
    .executeTakeFirst();
}

export async function setPartnerActive(
  orgId: string,
  partnerId: string,
  active: boolean,
): Promise<boolean> {
  const res = await db
    .updateTable('partners')
    .set({ active })
    .where('id', '=', partnerId)
    .where('org_id', '=', orgId)
    .executeTakeFirst();
  return Number(res.numUpdatedRows) > 0;
}

const n = (v: string | number | bigint | null): number => (v === null ? 0 : Number(v));

// Each partner with attribution stats and the commission owed on net (paid − refunded) revenue.
export async function listPartnerStats(orgId: string): Promise<PartnerStats[]> {
  const rows = await db
    .selectFrom('partners as p')
    .leftJoin('orders as o', 'o.partner_id', 'p.id')
    .where('p.org_id', '=', orgId)
    .groupBy(['p.id', 'p.code', 'p.name', 'p.commission_bps', 'p.active'])
    .orderBy('p.created_at', 'desc')
    .select((eb) => [
      'p.id as id',
      'p.code as code',
      'p.name as name',
      'p.commission_bps as commissionBps',
      'p.active as active',
      eb.fn.count<string>('o.id').filterWhere('o.status', '=', 'paid').as('attributedOrders'),
      eb.fn
        .sum<string | null>('o.amount_cents')
        .filterWhere('o.status', '=', 'paid')
        .as('grossCents'),
      eb.fn
        .sum<string | null>('o.amount_cents')
        .filterWhere('o.status', '=', 'refunded')
        .as('refundedCents'),
    ])
    .execute();

  return rows.map((r) => {
    const grossCents = n(r.grossCents);
    const refundedCents = n(r.refundedCents);
    return {
      id: r.id,
      code: r.code,
      name: r.name,
      commissionBps: r.commissionBps,
      active: r.active,
      attributedOrders: n(r.attributedOrders),
      grossCents,
      refundedCents,
      commissionCents: commissionCents(grossCents - refundedCents, r.commissionBps),
    };
  });
}
