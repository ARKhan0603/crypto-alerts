import { describe, expect, it } from 'vitest'
import { distanceToTarget, getAlertStatus, isThresholdHit } from './alertLogic'

describe('isThresholdHit', () => {
  it('fires "above" alerts at or over the target', () => {
    expect(isThresholdHit('above', 100, 100)).toBe(true)
    expect(isThresholdHit('above', 100, 99.99)).toBe(false)
  })
  it('fires "below" alerts at or under the target', () => {
    expect(isThresholdHit('below', 100, 100)).toBe(true)
    expect(isThresholdHit('below', 100, 100.01)).toBe(false)
  })
  it('never fires without a usable price', () => {
    expect(isThresholdHit('above', 100, null)).toBe(false)
    expect(isThresholdHit('below', 100, NaN)).toBe(false)
  })
})

describe('getAlertStatus', () => {
  const base = {
    alert_type: 'above',
    target_price: '100',
    is_active: true,
    triggered_at: null,
  }
  it('reports triggered before anything else', () => {
    expect(getAlertStatus({ ...base, is_active: false, triggered_at: 'x' }, 500)).toBe(
      'triggered',
    )
  })
  it('reports paused, hit and watching', () => {
    expect(getAlertStatus({ ...base, is_active: false }, 500)).toBe('paused')
    expect(getAlertStatus(base, 150)).toBe('hit')
    expect(getAlertStatus(base, 50)).toBe('watching')
    expect(getAlertStatus(base, null)).toBe('watching')
  })
})

describe('distanceToTarget', () => {
  it('is positive while the target is still ahead', () => {
    expect(distanceToTarget('above', 110, 100)).toBeCloseTo(10)
    expect(distanceToTarget('below', 90, 100)).toBeCloseTo(10)
  })
  it('is negative once crossed', () => {
    expect(distanceToTarget('above', 90, 100)).toBeCloseTo(-10)
  })
  it('returns null without a price', () => {
    expect(distanceToTarget('above', 90, null)).toBeNull()
  })
})
