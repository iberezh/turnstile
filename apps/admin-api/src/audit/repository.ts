import { adminDb } from '../db/admin-client.js';

export interface AdminAuditEntry {
  actorId: string;
  action: string;
  targetType: string;
  targetId: string;
  metadata?: unknown;
}

export async function writeAdminAudit(entry: AdminAuditEntry): Promise<void> {
  await adminDb
    .insertInto('admin_audit_log')
    .values({
      actor_id: entry.actorId,
      action: entry.action,
      target_type: entry.targetType,
      target_id: entry.targetId,
      metadata: entry.metadata ?? null,
    })
    .execute();
}

export interface AdminAuditRow {
  id: string;
  actorId: string;
  action: string;
  targetType: string;
  targetId: string;
  at: Date;
}

export async function listAdminAudit(limit = 100): Promise<AdminAuditRow[]> {
  const rows = await adminDb
    .selectFrom('admin_audit_log')
    .selectAll()
    .orderBy('at', 'desc')
    .limit(limit)
    .execute();
  return rows.map((r) => ({
    id: r.id,
    actorId: r.actor_id,
    action: r.action,
    targetType: r.target_type,
    targetId: r.target_id,
    at: r.at,
  }));
}
