type Client = (data: unknown) => void;

// In-memory fan-out of check-in events, keyed by event id, to the live door dashboards (SSE).
// Single-process only; a multi-instance deploy would back this with Redis pub/sub.
const channels = new Map<string, Set<Client>>();

export function addClient(eventId: string, client: Client): void {
  const set = channels.get(eventId) ?? new Set<Client>();
  set.add(client);
  channels.set(eventId, set);
}

export function removeClient(eventId: string, client: Client): void {
  const set = channels.get(eventId);
  if (!set) return;
  set.delete(client);
  if (set.size === 0) channels.delete(eventId);
}

export function broadcast(eventId: string, data: unknown): void {
  const set = channels.get(eventId);
  if (!set) return;
  for (const client of set) client(data);
}
