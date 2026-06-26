import { z } from 'zod';

export const EVENT_STATUSES = ['draft', 'published', 'cancelled'] as const;
export type EventStatus = (typeof EVENT_STATUSES)[number];

// URL-safe base from a title; a short random suffix is appended at create time for uniqueness.
export function slugify(title: string): string {
  const base = title
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  return base || 'event';
}

export const CreateEventSchema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().max(5000).optional(),
  venueName: z.string().max(200).optional(),
  venueAddress: z.string().max(300).optional(),
  coverImageUrl: z.string().url().max(500).optional(),
  startsAt: z.coerce.date(),
  endsAt: z.coerce.date().optional(),
  timezone: z.string().max(60).optional(),
  // Map pin from the organizer; both or neither (h3 is derived only when both are present).
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
});

export const UpdateEventSchema = CreateEventSchema.partial();

export const TicketTypeSchema = z.object({
  name: z.string().min(1).max(120),
  priceCents: z.number().int().min(0),
  currency: z.string().length(3).toLowerCase().optional(),
  capacity: z.number().int().min(0),
  salesStart: z.coerce.date().optional(),
  salesEnd: z.coerce.date().optional(),
  position: z.number().int().min(0).optional(),
});

export const UpdateTicketTypeSchema = TicketTypeSchema.partial();

// Public marketplace discovery: free-text title search + date-range filter + pagination.
export const DiscoverySchema = z.object({
  q: z.string().min(1).max(100).optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

export type DiscoveryInput = z.infer<typeof DiscoverySchema>;

// "Events near me": a point + how many to return, ranked nearest-first.
export const NearbySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export type NearbyInput = z.infer<typeof NearbySchema>;

export type CreateEventInput = z.infer<typeof CreateEventSchema>;
export type UpdateEventInput = z.infer<typeof UpdateEventSchema>;
export type TicketTypeInput = z.infer<typeof TicketTypeSchema>;
export type UpdateTicketTypeInput = z.infer<typeof UpdateTicketTypeSchema>;
