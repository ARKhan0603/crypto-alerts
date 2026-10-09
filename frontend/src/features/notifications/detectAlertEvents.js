import { formatPrice } from '../../lib/format'
import { getAlertStatus } from '../../lib/alertLogic'
import { ALERT_STATUS, ALERT_TYPES } from '../../lib/constants'

const directionWord = (type) => (type === ALERT_TYPES.ABOVE ? 'above' : 'below')

/**
 * Decide which notifications the current alerts + prices call for. Pure, so it is easy to
 * test; the listener middleware turns the result into dispatched actions.
 *
 * @returns {{ seedIds: number[] | null, notifications: object[] }}
 */
export function detectAlertEvents({ alerts, prices, acknowledged, seeded }) {
  const known = new Set(acknowledged)
  const notifications = []

  // First load of the session: alerts that fired earlier are history, not news.
  const seedIds = seeded ? null : alerts.filter((a) => a.triggered_at).map((a) => a.id)
  for (const id of seedIds ?? []) known.add(id)

  for (const alert of alerts) {
    if (known.has(alert.id)) continue

    const coin = prices[alert.symbol]
    const status = getAlertStatus(alert, coin?.price ?? null)
    if (status !== ALERT_STATUS.HIT && status !== ALERT_STATUS.TRIGGERED) continue

    const target = formatPrice(alert.target_price)
    const current = coin?.price != null ? ` Now ${formatPrice(coin.price)}.` : ''
    notifications.push({
      id: `alert-${alert.id}`,
      kind: status,
      symbol: alert.symbol,
      alertId: alert.id,
      title: `${alert.symbol} went ${directionWord(alert.alert_type)} ${target}`,
      message:
        status === ALERT_STATUS.HIT
          ? `Your target was reached.${current}`
          : `Your alert fired and has been deactivated.${current}`,
    })
  }

  return { seedIds, notifications }
}
