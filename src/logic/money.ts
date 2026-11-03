/** Money is stored as integer cents everywhere and only formatted at the edge. */
export function formatCents(cents: number): string {
  const sign = cents < 0 ? '-' : '';
  const abs = Math.abs(Math.round(cents));
  return `${sign}$${Math.floor(abs / 100)}.${String(abs % 100).padStart(2, '0')}`;
}

/** Unit prices are fractional cents, so they get their own formatter. */
export function formatUnitPrice(centsPerUnit: number, unitLabel: string): string {
  const dollars = centsPerUnit / 100;
  const text = dollars < 1 ? dollars.toFixed(3) : dollars.toFixed(2);
  return `$${text} / ${unitLabel}`;
}
