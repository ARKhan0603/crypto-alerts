import { combineReducers, configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'
import authReducer from '../features/auth/authSlice'
import notificationsReducer from '../features/notifications/notificationsSlice'
import uiReducer from '../features/ui/uiSlice'
import { api } from '../services/api'
import { listenerMiddleware } from './listenerMiddleware'

const rootReducer = combineReducers({
  [api.reducerPath]: api.reducer,
  auth: authReducer,
  ui: uiReducer,
  notifications: notificationsReducer,
})

export function createStore(preloadedState) {
  const store = configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: (getDefault) =>
      getDefault().prepend(listenerMiddleware.middleware).concat(api.middleware),
  })
  setupListeners(store.dispatch) // refetch on window focus / reconnect
  return store
}

export const store = createStore()
