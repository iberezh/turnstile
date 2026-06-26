export interface NavLink {
  label: string;
  to: string;
}

// Single source of truth for the public site's primary navigation — shared by the header, the
// mobile menu, and the footer so they never drift apart.
export const publicNavLinks: NavLink[] = [
  { label: "What's on", to: '/#whats-on' },
  { label: 'Trusted by', to: '/trusted-by' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
];
