import { type EventRecord, getEventById } from './repository.js';

// Resource-ownership half of the tenant guard: the event must belong to the org in the path.
// Returns null when the event is missing or owned by a different org (handler responds 404).
export async function loadOwnedEvent(orgId: string, eventId: string): Promise<EventRecord | null> {
  const event = await getEventById(eventId);
  return event && event.orgId === orgId ? event : null;
}
