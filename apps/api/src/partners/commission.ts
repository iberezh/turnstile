// Partner commission = basis points of attributed net revenue (paid minus refunded), floored to
// whole cents. Never negative — a partner whose attributed orders were all refunded earns nothing.
export function commissionCents(netCents: number, bps: number): number {
  return Math.floor((Math.max(0, netCents) * bps) / 10000);
}
