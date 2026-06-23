import type { Selectable } from 'kysely';
import { db } from '../db/client.js';
import type { PromoCodesTable } from '../db/schema.js';
import type { DiscountType } from './discount.js';
import type { CreatePromoInput } from './schemas.js';

export interface PromoRecord {
  id: string;
  eventId: string;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  maxRedemptions: number | null;
  redeemedCount: number;
  startsAt: Date | null;
  endsAt: Date | null;
  active: boolean;
}

// Stored values come from a controlled enum, but narrow defensively so a bad row can't widen types.
function toRecord(row: Selectable<PromoCodesTable>): PromoRecord {
  return {
    id: row.id,
    eventId: row.event_id,
    code: row.code,
    discountType: row.discount_type === 'fixed' ? 'fixed' : 'percent',
    discountValue: row.discount_value,
    maxRedemptions: row.max_redemptions,
    redeemedCount: row.redeemed_count,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    active: row.active,
  };
}

export const normalizeCode = (code: string): string => code.trim().toUpperCase();

export async function findPromoByCode(
  eventId: string,
  code: string,
): Promise<PromoRecord | undefined> {
  const row = await db
    .selectFrom('promo_codes')
    .selectAll()
    .where('event_id', '=', eventId)
    .where('code', '=', normalizeCode(code))
    .executeTakeFirst();
  return row ? toRecord(row) : undefined;
}

export async function listPromos(eventId: string): Promise<PromoRecord[]> {
  const rows = await db
    .selectFrom('promo_codes')
    .selectAll()
    .where('event_id', '=', eventId)
    .orderBy('created_at', 'desc')
    .execute();
  return rows.map(toRecord);
}

export async function createPromo(eventId: string, input: CreatePromoInput): Promise<PromoRecord> {
  const row = await db
    .insertInto('promo_codes')
    .values({
      event_id: eventId,
      code: normalizeCode(input.code),
      discount_type: input.discountType,
      discount_value: input.discountValue,
      max_redemptions: input.maxRedemptions ?? null,
      starts_at: input.startsAt ? new Date(input.startsAt) : null,
      ends_at: input.endsAt ? new Date(input.endsAt) : null,
    })
    .returningAll()
    .executeTakeFirstOrThrow();
  return toRecord(row);
}

export async function setPromoActive(
  eventId: string,
  promoId: string,
  active: boolean,
): Promise<boolean> {
  const res = await db
    .updateTable('promo_codes')
    .set({ active })
    .where('id', '=', promoId)
    .where('event_id', '=', eventId)
    .executeTakeFirst();
  return Number(res.numUpdatedRows) > 0;
}
