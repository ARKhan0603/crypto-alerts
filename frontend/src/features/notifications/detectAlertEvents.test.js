import { describe, expect, it } from 'vitest'
import { makeAlert } from '../../test/utils'
import { detectAlertEvents } from './detectAlertEvents'

const prices = { BTC: { symbol: 'BTC', name: 'Bitcoin', price: 71000 } }
const run = (overrides) =>
  detectAlertEvents({ alerts: [], prices, acknowledged: [], seeded: true, ...overrides })

describe('detectAlertEvents', () => {
  it('raises a "hit" notification when the live price crosses an active alert', () => {
    const { notifications } = run({ alerts: [makeAlert()] })
    expect(notifications).toHaveLength(1)
    expect(notifications[0]).toMatchObject({ id: 'alert-1', kind: 'hit', alertId: 1 })
  })

  it('stays quiet while the target has not been reached', () => {
    const { notifications } = run({ alerts: [makeAlert({ target_price: '80000' })] })
    expect(notifications).toEqual([])
  })

  it('does not repeat an alert that was already acknowledged', () => {
    const { notifications } = run({ alerts: [makeAlert()], acknowledged: [1] })
    expect(notifications).toEqual([])
  })

  it('raises "triggered" when the backend fires an alert during the session', () => {
    const fired = makeAlert({ is_active: false, triggered_at: '2026-10-07T10:00:00Z' })
    const { notifications } = run({ alerts: [fired] })
    expect(notifications[0]).toMatchObject({ kind: 'triggered' })
  })

  it('seeds historic triggered alerts silently on the first load', () => {
    const fired = makeAlert({
      id: 7,
      is_active: false,
      triggered_at: '2026-10-01T10:00:00Z',
    })
    const { seedIds, notifications } = run({ alerts: [fired], seeded: false })
    expect(seedIds).toEqual([7])
    expect(notifications).toEqual([])
  })

  it('ignores paused alerts', () => {
    const { notifications } = run({ alerts: [makeAlert({ is_active: false })] })
    expect(notifications).toEqual([])
  })
})
