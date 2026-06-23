import { db } from '../db/client.js';

export interface AuditEntry {
  actorId: string;
  scope: 'org' | 'platform';
  orgId?: string | null;
  action: string;
  target: string;
  before?: unknown;
  after?: unknown;
}

// Append-only record of every privileged action (role changes, removals, refunds, payouts…).
// Never updated or deleted; the trail is part of the product's trust story.
export async function writeAudit(entry: AuditEntry): Promise<void> {
  await db
    .insertInto('audit_log')
    .values({
      actor_id: entry.actorId,
      scope: entry.scope,
      org_id: entry.orgId ?? null,
      action: entry.action,
      target: entry.target,
      before: entry.before ?? null,
      after: entry.after ?? null,
    })
    .execute();
}
