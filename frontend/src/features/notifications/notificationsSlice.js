import {
  createEntityAdapter,
  createSelector,
  createSlice,
  nanoid,
} from '@reduxjs/toolkit'
import { loggedOut } from '../auth/authSlice'

const TOAST_ONLY_KINDS = ['info', 'error']

const adapter = createEntityAdapter({
  sortComparer: (a, b) => b.createdAt - a.createdAt,
})

/**
 * `acknowledged` holds alert ids we have already told the user about, so a threshold hit
 * detected client-side and the same alert later deactivated by the backend raise only one
 * notification. `seeded` flips once the first alert list is loaded so alerts that fired
 * before this session do not replay as new notifications.
 */
const initialState = adapter.getInitialState({
  acknowledged: [],
  seeded: false,
})

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    notificationAdded: {
      reducer(state, { payload }) {
        if (!state.entities[payload.id]) adapter.addOne(state, payload)
      },
      prepare({ id, kind, title, message, symbol }) {
        return {
          payload: {
            id: id ?? nanoid(),
            kind, // hit | triggered (persistent feed) · info | error (toast only)
            title,
            message,
            symbol: symbol ?? null,
            createdAt: Date.now(),
            read: false,
            toast: true,
          },
        }
      },
    },
    alertsAcknowledged(state, { payload: ids }) {
      for (const id of ids) {
        if (!state.acknowledged.includes(id)) state.acknowledged.push(id)
      }
    },
    alertsSeeded(state, { payload: ids }) {
      state.seeded = true
      for (const id of ids) {
        if (!state.acknowledged.includes(id)) state.acknowledged.push(id)
      }
    },
    toastDismissed(state, { payload: id }) {
      const notification = state.entities[id]
      if (!notification) return
      if (TOAST_ONLY_KINDS.includes(notification.kind)) adapter.removeOne(state, id)
      else notification.toast = false
    },
    notificationRead(state, { payload: id }) {
      if (state.entities[id]) state.entities[id].read = true
    },
    allNotificationsRead(state) {
      for (const n of Object.values(state.entities)) n.read = true
    },
    notificationRemoved: adapter.removeOne,
    notificationsCleared(state) {
      adapter.removeAll(state)
    },
  },
  extraReducers: (builder) => {
    builder.addCase(loggedOut, () => initialState)
  },
})

export const {
  notificationAdded,
  alertsAcknowledged,
  alertsSeeded,
  toastDismissed,
  notificationRead,
  allNotificationsRead,
  notificationRemoved,
  notificationsCleared,
} = notificationsSlice.actions

const selectors = adapter.getSelectors((state) => state.notifications)
export const selectAllNotifications = selectors.selectAll
export const selectNotificationsSeeded = (state) => state.notifications.seeded
export const selectAcknowledgedAlertIds = (state) => state.notifications.acknowledged

/** The bell's persistent feed excludes transient info/error toasts. */
export const selectFeed = createSelector(selectAllNotifications, (list) =>
  list.filter((n) => !TOAST_ONLY_KINDS.includes(n.kind)),
)
export const selectUnreadCount = createSelector(selectFeed, (feed) =>
  feed.reduce((count, n) => count + (n.read ? 0 : 1), 0),
)
export const selectToasts = createSelector(selectAllNotifications, (list) =>
  list.filter((n) => n.toast).slice(0, 3),
)

export default notificationsSlice.reducer
