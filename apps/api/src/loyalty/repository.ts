import type { Kysely } from 'kysely';
import { db } from '../db/client.js';
import type { Database } from '../db/schema.js';

// Accept any executor so credit/debit can run inside the checkout fulfilment transaction (where
// earn/redeem must be atomic with the order) or standalone (manual adjustments).
type Executor = Kysely<Database>;

export async function getBalance(orgId: string, email: string): Promise<number> {
  const row = await db
    .selectFrom('loyalty_accounts')
    .select('points_balance')
    .where('org_id', '=', orgId)
    .where('email', '=', email)
    .executeTakeFirst();
  return row?.points_balance ?? 0;
}

// Add points (upsert the account) and append a ledger entry. points must be > 0.
export async function creditPoints(
  exec: Executor,
  orgId: string,
  email: string,
  orderId: string | null,
  points: number,
  reason: string,
): Promise<void> {
  await exec
    .insertInto('loyalty_accounts')
    .values({ org_id: orgId, email, points_balance: points })
    .onConflict((oc) =>
      oc.columns(['org_id', 'email']).doUpdateSet((eb) => ({
        points_balance: eb('loyalty_accounts.points_balance', '+', points),
      })),
    )
    .execute();
  await exec
    .insertInto('loyalty_ledger')
    .values({ org_id: orgId, email, order_id: orderId, delta: points, reason })
    .execute();
}

// Atomically subtract points only if the balance covers it (same conditional-update guard as
// inventory). Returns false when there aren't enough (or no account); no ledger entry is written.
// Spending points is intentionally an authorized, org-side action (the adjust route, loyalty:manage)
// — never the public checkout, which can't prove the caller owns the email a balance is keyed to.
export async function debitPoints(
  exec: Executor,
  orgId: string,
  email: string,
  orderId: string | null,
  points: number,
  reason: string,
): Promise<boolean> {
  const res = await exec
    .updateTable('loyalty_accounts')
    .set((eb) => ({ points_balance: eb('points_balance', '-', points) }))
    .where('org_id', '=', orgId)
    .where('email', '=', email)
    .where('points_balance', '>=', points)
    .executeTakeFirst();
  if (Number(res.numUpdatedRows) === 0) return false;
  await exec
    .insertInto('loyalty_ledger')
    .values({ org_id: orgId, email, order_id: orderId, delta: -points, reason })
    .execute();
  return true;
}

export interface LoyaltyAccount {
  email: string;
  pointsBalance: number;
}

export async function listAccounts(orgId: string): Promise<LoyaltyAccount[]> {
  const rows = await db
    .selectFrom('loyalty_accounts')
    .select(['email', 'points_balance'])
    .where('org_id', '=', orgId)
    .orderBy('points_balance', 'desc')
    .execute();
  return rows.map((r) => ({ email: r.email, pointsBalance: r.points_balance }));
}

export interface LedgerEntry {
  delta: number;
  reason: string;
  orderId: string | null;
  createdAt: Date;
}

export async function listLedger(orgId: string, email: string): Promise<LedgerEntry[]> {
  const rows = await db
    .selectFrom('loyalty_ledger')
    .select(['delta', 'reason', 'order_id', 'created_at'])
    .where('org_id', '=', orgId)
    .where('email', '=', email)
    .orderBy('created_at', 'desc')
    .limit(200)
    .execute();
  return rows.map((r) => ({
    delta: r.delta,
    reason: r.reason,
    orderId: r.order_id,
    createdAt: r.created_at,
  }));
}
