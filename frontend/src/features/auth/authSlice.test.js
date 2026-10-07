import { describe, expect, it } from 'vitest'
import reducer, { credentialsSet, loggedOut, selectIsAuthenticated } from './authSlice'

describe('authSlice', () => {
  it('stores and clears credentials', () => {
    let state = reducer(
      { token: null, username: null },
      credentialsSet({ token: 't', username: 'ali' }),
    )
    expect(state).toEqual({ token: 't', username: 'ali' })
    expect(selectIsAuthenticated({ auth: state })).toBe(true)
    state = reducer(state, loggedOut())
    expect(selectIsAuthenticated({ auth: state })).toBe(false)
  })
})
