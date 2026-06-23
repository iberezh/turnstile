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

export type CreateEventInput = z.infer<typeof CreateEventSchema>;
export type UpdateEventInput = z.infer<typeof UpdateEventSchema>;
export type TicketTypeInput = z.infer<typeof TicketTypeSchema>;
export type UpdateTicketTypeInput = z.infer<typeof UpdateTicketTypeSchema>;
