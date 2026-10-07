import { describe, expect, it } from 'vitest'
import { formatPercent, formatPrice, formatRelativeTime } from './format'

describe('formatPrice', () => {
  it('formats regular and sub-dollar prices', () => {
    expect(formatPrice('65000.5')).toBe('$65,000.50')
    expect(formatPrice(0.5123)).toBe('$0.5123')
  })
  it('handles missing values', () => {
    expect(formatPrice(null)).toBe('—')
    expect(formatPrice('abc')).toBe('—')
  })
})

describe('formatPercent', () => {
  it('signs positives', () => {
    expect(formatPercent(1.234)).toBe('+1.23%')
    expect(formatPercent(-2)).toBe('-2.00%')
    expect(formatPercent(null)).toBe('—')
  })
})

describe('formatRelativeTime', () => {
  const now = new Date('2026-10-07T12:00:00Z').getTime()
  it('scales units', () => {
    expect(formatRelativeTime('2026-10-07T11:59:55Z', now)).toBe('just now')
    expect(formatRelativeTime('2026-10-07T11:59:00Z', now)).toBe('1m ago')
    expect(formatRelativeTime('2026-10-07T09:00:00Z', now)).toBe('3h ago')
    expect(formatRelativeTime(null, now)).toBe('never')
  })
})
