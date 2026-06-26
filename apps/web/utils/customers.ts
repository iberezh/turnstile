// Curated showcase of organizers Turnstile promotes ("Trusted by"). Static for now — the small
// first step; a later phase replaces this with real featured orgs driven by a paid subscription.
export interface Customer {
  name: string;
  category: string;
}

export const featuredCustomers: Customer[] = [
  { name: 'Lumen Collective', category: 'Live music' },
  { name: 'Northgate Arena', category: 'Venue' },
  { name: 'Pulse Nightlife', category: 'Clubs' },
  { name: 'Harbor Sessions', category: 'Festivals' },
  { name: 'The Glasshouse', category: 'Venue' },
  { name: 'Riverside Festivals', category: 'Festivals' },
  { name: 'Atlas Live', category: 'Touring' },
  { name: 'Neon District', category: 'Nightlife' },
  { name: 'Civic Hall', category: 'Conferences' },
  { name: 'Sunset Sounds', category: 'Outdoor' },
];

export interface Testimonial {
  quote: string;
  name: string;
  role: string;
}

export const testimonials: Testimonial[] = [
  {
    quote:
      'We sold out three nights in a row and never touched a spreadsheet. The door scanned every ticket in seconds.',
    name: 'Mara Vey',
    role: 'Programming, The Glasshouse',
  },
  {
    quote:
      'Payouts land in our own Stripe account the next day. No chasing, no surprises at the end of the month.',
    name: 'Devon Park',
    role: 'Founder, Pulse Nightlife',
  },
  {
    quote:
      'Being featured put us in front of people searching for events near them. Half our weekend crowd found us that way.',
    name: 'Iris Cole',
    role: 'Producer, Harbor Sessions',
  },
];

// Two-letter monogram for a business, used in place of real logos in the showcase grid.
export function initials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w.charAt(0))
    .join('')
    .toUpperCase();
}
