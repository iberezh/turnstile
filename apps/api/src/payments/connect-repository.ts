import { db } from '../db/client.js';

export interface OrgConnect {
  stripeAccountId: string | null;
  chargesEnabled: boolean;
}

export async function getOrgConnect(orgId: string): Promise<OrgConnect | undefined> {
  const row = await db
    .selectFrom('organizations')
    .select(['stripe_account_id', 'charges_enabled'])
    .where('id', '=', orgId)
    .executeTakeFirst();
  return row
    ? { stripeAccountId: row.stripe_account_id, chargesEnabled: row.charges_enabled }
    : undefined;
}

export async function setStripeAccount(orgId: string, accountId: string): Promise<void> {
  await db
    .updateTable('organizations')
    .set({ stripe_account_id: accountId })
    .where('id', '=', orgId)
    .execute();
}

export async function setChargesEnabled(orgId: string, enabled: boolean): Promise<void> {
  await db
    .updateTable('organizations')
    .set({ charges_enabled: enabled })
    .where('id', '=', orgId)
    .execute();
}
