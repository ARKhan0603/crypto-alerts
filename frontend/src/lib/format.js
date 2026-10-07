const usd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const usdPrecise = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 4,
  maximumFractionDigits: 6,
})

/** Format a price; sub-dollar assets (XRP, DOGE…) get extra precision. */
export function formatPrice(value) {
  const n = Number(value)
  if (value === null || value === undefined || value === '' || Number.isNaN(n)) return '—'
  return Math.abs(n) < 1 ? usdPrecise.format(n) : usd.format(n)
}

export function formatPercent(value, { signed = true } = {}) {
  if (!Number.isFinite(value)) return '—'
  const sign = signed && value > 0 ? '+' : ''
  return `${sign}${value.toFixed(2)}%`
}

export function formatRelativeTime(iso, now = Date.now()) {
  if (!iso) return 'never'
  const seconds = Math.max(0, Math.round((now - new Date(iso).getTime()) / 1000))
  if (seconds < 10) return 'just now'
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.round(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.round(hours / 24)}d ago`
}
