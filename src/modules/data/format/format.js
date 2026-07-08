/** Small display formatters shared across pages. */
const CURRENCY = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

export function currency(n) {
  if (n == null || n === '') return '—';
  const v = Number(n);
  return Number.isFinite(v) ? CURRENCY.format(v) : String(n);
}

export function yesNo(b) {
  return b ? 'Yes' : 'No';
}

export function dateLabel(isoDate) {
  if (!isoDate) return '—';
  const d = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(d.getTime())) return String(isoDate);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
