import { createSelector } from '@reduxjs/toolkit'
import { distanceToTarget, getAlertStatus } from '../../lib/alertLogic'
import { api } from '../../services/api'
import { selectPricesBySymbol } from '../prices/selectors'
import { selectAlertFilter } from '../ui/uiSlice'

const selectAlertsResult = api.endpoints.getAlerts.select()

export const selectRawAlerts = createSelector(
  selectAlertsResult,
  (result) => result.data ?? [],
)

/** Alerts joined with the cached live price → status, current price and distance to target. */
export const selectAlertsWithStatus = createSelector(
  [selectRawAlerts, selectPricesBySymbol],
  (alerts, prices) =>
    alerts.map((alert) => {
      const coin = prices[alert.symbol]
      const price = coin?.price ?? null
      const target = Number(alert.target_price)
      return {
        ...alert,
        coinName: coin?.name ?? alert.symbol,
        target,
        price,
        status: getAlertStatus(alert, price),
        distance: distanceToTarget(alert.alert_type, target, price),
      }
    }),
)

export const selectVisibleAlerts = createSelector(
  [selectAlertsWithStatus, selectAlertFilter],
  (alerts, filter) => {
    if (filter === 'active')
      return alerts.filter((a) => a.status === 'watching' || a.status === 'hit')
    if (filter === 'triggered') return alerts.filter((a) => a.status === 'triggered')
    return alerts
  },
)

export const selectAlertCounts = createSelector(selectAlertsWithStatus, (alerts) => {
  const counts = { all: alerts.length, active: 0, triggered: 0, hit: 0 }
  for (const alert of alerts) {
    if (alert.status === 'triggered') counts.triggered += 1
    if (alert.status === 'watching' || alert.status === 'hit') counts.active += 1
    if (alert.status === 'hit') counts.hit += 1
  }
  return counts
})

/** symbol → number of alerts currently hit by the live price (drives price-card indicators). */
export const selectHitCountBySymbol = createSelector(selectAlertsWithStatus, (alerts) => {
  const counts = {}
  for (const alert of alerts) {
    if (alert.status === 'hit') counts[alert.symbol] = (counts[alert.symbol] ?? 0) + 1
  }
  return counts
})

export const makeSelectAlertById = (id) =>
  createSelector(selectRawAlerts, (alerts) => alerts.find((a) => a.id === id) ?? null)
