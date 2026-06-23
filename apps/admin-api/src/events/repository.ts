import { appDb } from '../db/app-client.js';

export type ModerationStatus = 'ok' | 'removed';

export interface AdminEventRow {
  id: string;
  slug: string;
  title: string;
  status: string;
  moderationStatus: string;
}

export async function getEvent(eventId: string): Promise<AdminEventRow | undefined> {
  const r = await appDb
    .selectFrom('events')
    .select(['id', 'slug', 'title', 'status', 'moderation_status'])
    .where('id', '=', eventId)
    .executeTakeFirst();
  return r
    ? {
        id: r.id,
        slug: r.slug,
        title: r.title,
        status: r.status,
        moderationStatus: r.moderation_status,
      }
    : undefined;
}

// Cross-plane write: 'removed' hides the event from public discovery; 'ok' restores it.
export async function setEventModeration(eventId: string, status: ModerationStatus): Promise<void> {
  await appDb
    .updateTable('events')
    .set({ moderation_status: status, moderated_at: status === 'ok' ? null : new Date() })
    .where('id', '=', eventId)
    .execute();
}
