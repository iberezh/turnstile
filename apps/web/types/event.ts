// Shapes returned by the public API (dates arrive as ISO strings over JSON).
export interface EventDto {
  id: string;
  orgId: string;
  slug: string;
  title: string;
  description: string | null;
  venueName: string | null;
  venueAddress: string | null;
  coverImageUrl: string | null;
  startsAt: string;
  endsAt: string | null;
  timezone: string;
  status: string;
}

export interface TicketTypeDto {
  id: string;
  name: string;
  priceCents: number;
  currency: string;
  capacity: number;
  position: number;
}

export interface EventDetailDto {
  event: EventDto;
  ticketTypes: TicketTypeDto[];
}
