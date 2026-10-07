import { createSlice } from '@reduxjs/toolkit'

/** `editor` is the alert form drawer: closed, creating (optionally preset to a coin), or editing. */
const initialState = {
  editor: { open: false, alertId: null, symbol: null },
  notificationsOpen: false,
  alertFilter: 'all', // all | active | triggered
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    editorOpened(state, { payload }) {
      state.editor = {
        open: true,
        alertId: payload?.alertId ?? null,
        symbol: payload?.symbol ?? null,
      }
    },
    editorClosed(state) {
      state.editor = { open: false, alertId: null, symbol: null }
    },
    notificationsToggled(state, { payload }) {
      state.notificationsOpen = payload ?? !state.notificationsOpen
    },
    alertFilterChanged(state, { payload }) {
      state.alertFilter = payload
    },
  },
  selectors: {
    selectEditor: (state) => state.editor,
    selectNotificationsOpen: (state) => state.notificationsOpen,
    selectAlertFilter: (state) => state.alertFilter,
  },
})

export const { editorOpened, editorClosed, notificationsToggled, alertFilterChanged } =
  uiSlice.actions
export const { selectEditor, selectNotificationsOpen, selectAlertFilter } =
  uiSlice.selectors
export default uiSlice.reducer
