import { ALERT_STATUS, ALERT_TYPES } from './constants'

export function isThresholdHit(alertType, targetPrice, price) {
  if (!Number.isFinite(price) || !Number.isFinite(targetPrice)) return false
  return alertType === ALERT_TYPES.ABOVE ? price >= targetPrice : price <= targetPrice
}

export function getAlertStatus(alert, price) {
  if (alert.triggered_at) return ALERT_STATUS.TRIGGERED
  if (!alert.is_active) return ALERT_STATUS.PAUSED
  return isThresholdHit(alert.alert_type, Number(alert.target_price), price)
    ? ALERT_STATUS.HIT
    : ALERT_STATUS.WATCHING
}

export function distanceToTarget(alertType, targetPrice, price) {
  if (!Number.isFinite(price) || price === 0 || !Number.isFinite(targetPrice)) return null
  const move = ((targetPrice - price) / price) * 100
  return alertType === ALERT_TYPES.ABOVE ? move : -move
}

/** 0-100: how close the price is to the target (full once the target is reached). */
export function getProgress(distance) {
  if (distance === null) return 0
  if (distance <= 0) return 100
  return Math.max(4, Math.min(96, 100 - distance * 4))
}
