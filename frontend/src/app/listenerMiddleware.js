import { createListenerMiddleware, isAnyOf, isRejectedWithValue } from '@reduxjs/toolkit'
import { STORAGE_KEYS } from '../lib/config'
import { getErrorMessage } from '../lib/errors'
import { writeStorage } from '../lib/storage'
import { credentialsSet, loggedOut } from '../features/auth/authSlice'
import { detectAlertEvents } from '../features/notifications/detectAlertEvents'
import {
  alertsAcknowledged,
  alertsSeeded,
  notificationAdded,
} from '../features/notifications/notificationsSlice'
import { selectRawAlerts } from '../features/alerts/selectors'
import { selectPricesBySymbol } from '../features/prices/selectors'
import { api } from '../services/api'

/**
 * Side effects live here rather than in components: session persistence, cache cleanup on
 * logout, threshold-hit detection against the RTK Query cache, and mutation feedback.
 */
export const listenerMiddleware = createListenerMiddleware()
const { startListening } = listenerMiddleware

// 1 ─ Persist the session.
startListening({
  actionCreator: credentialsSet,
  effect: ({ payload }) => {
    writeStorage(STORAGE_KEYS.token, payload.token)
    writeStorage(STORAGE_KEYS.username, payload.username)
  },
})

// 2 ─ On logout clear storage and every cached response so nothing leaks to the next user.
startListening({
  actionCreator: loggedOut,
  effect: (_action, { dispatch }) => {
    writeStorage(STORAGE_KEYS.token, null)
    writeStorage(STORAGE_KEYS.username, null)
    dispatch(api.util.resetApiState())
  },
})

// 3 ─ Whenever alerts or prices refresh, check thresholds against the cached data.
startListening({
  matcher: isAnyOf(
    api.endpoints.getAlerts.matchFulfilled,
    api.endpoints.getCryptocurrencies.matchFulfilled,
  ),
  effect: (_action, { dispatch, getState }) => {
    const state = getState()
    if (!state.auth.token) return

    const alertsQuery = api.endpoints.getAlerts.select()(state)
    if (!alertsQuery.isSuccess) return // wait for the first alert list before evaluating

    const { seedIds, notifications } = detectAlertEvents({
      alerts: selectRawAlerts(state),
      prices: selectPricesBySymbol(state),
      acknowledged: state.notifications.acknowledged,
      seeded: state.notifications.seeded,
    })

    if (seedIds) dispatch(alertsSeeded(seedIds))
    if (notifications.length) {
      dispatch(alertsAcknowledged(notifications.map((n) => n.alertId)))
      for (const { alertId: _alertId, ...notification } of notifications) {
        dispatch(notificationAdded(notification))
      }
    }
  },
})

// 4 ─ Confirmation toasts for alert mutations.
const successMessages = [
  [
    api.endpoints.createAlert.matchFulfilled,
    'Alert created',
    'Watching the price for you.',
  ],
  [api.endpoints.updateAlert.matchFulfilled, 'Alert updated', 'Your changes were saved.'],
  [api.endpoints.deleteAlert.matchFulfilled, 'Alert deleted', 'It will no longer fire.'],
]
for (const [matcher, title, message] of successMessages) {
  startListening({
    matcher,
    effect: (_action, { dispatch }) => {
      dispatch(notificationAdded({ kind: 'info', title, message }))
    },
  })
}

// 5 ─ Surface failed alert mutations (the optimistic update is rolled back by the endpoint).
startListening({
  matcher: isAnyOf(
    api.endpoints.updateAlert.matchRejected,
    api.endpoints.deleteAlert.matchRejected,
  ),
  effect: (action, { dispatch }) => {
    if (action.meta?.condition) return
    const error = isRejectedWithValue(action) ? action.payload : action.error
    dispatch(
      notificationAdded({
        kind: 'error',
        title: 'Could not save change',
        message: getErrorMessage(error),
      }),
    )
  },
})
