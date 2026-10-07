import { createSlice } from '@reduxjs/toolkit'
import { STORAGE_KEYS } from '../../lib/config'
import { readStorage } from '../../lib/storage'

const initialState = {
  token: readStorage(STORAGE_KEYS.token),
  username: readStorage(STORAGE_KEYS.username),
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    credentialsSet(state, { payload }) {
      state.token = payload.token
      state.username = payload.username
    },
    loggedOut(state) {
      state.token = null
      state.username = null
    },
  },
  selectors: {
    selectToken: (state) => state.token,
    selectUsername: (state) => state.username,
    selectIsAuthenticated: (state) => Boolean(state.token),
  },
})

export const { credentialsSet, loggedOut } = authSlice.actions
export const { selectToken, selectUsername, selectIsAuthenticated } = authSlice.selectors
export default authSlice.reducer
