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
  lat: number | null;
  lng: number | null;
  status: string;
}

// A published event with its great-circle distance from the query point (from GET /events/near).
export interface NearbyEventDto extends EventDto {
  distanceKm: number;
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

export interface TierBreakdown {
  ticketTypeId: string;
  name: string;
  capacity: number;
  reserved: number;
  sold: number;
}
export interface SalesDay {
  day: string;
  orders: number;
  grossCents: number;
}
export interface EventAnalytics {
  ticketsIssued: number;
  ticketsCheckedIn: number;
  checkinRate: number;
  byTicketType: TierBreakdown[];
  salesByDay: SalesDay[];
}
