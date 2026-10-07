import { afterEach, describe, expect, it, vi } from 'vitest'
import { selectAlertsWithStatus } from '../features/alerts/selectors'
import { selectFeed } from '../features/notifications/notificationsSlice'
import { api } from '../services/api'
import { makeAlert, makeCoin, mockApi } from '../test/utils'
import { createStore } from './store'

afterEach(() => vi.unstubAllGlobals())

const signedIn = () => createStore({ auth: { token: 'tok', username: 'ali' } })

describe('store + RTK Query', () => {
  it('logs in, keeps the token and persists the session', async () => {
    const { calls } = mockApi({ 'POST /auth/login/': () => ({ body: { token: 'abc' } }) })
    const store = createStore({ auth: { token: null, username: null } })

    await store.dispatch(
      api.endpoints.login.initiate({ username: 'ali', password: 'pw' }),
    )

    expect(store.getState().auth).toEqual({ token: 'abc', username: 'ali' })
    expect(localStorage.getItem('tickr.token')).toBe('abc')
    expect(calls).toHaveLength(1)
  })

  it('sends the Token header and walks every alert page', async () => {
    const { calls } = mockApi({
      'GET /alerts/': ({ url }) =>
        url.searchParams.get('page') === '1'
          ? { body: { next: 'x', results: [makeAlert({ id: 1 })] } }
          : { body: { next: null, results: [makeAlert({ id: 2, target_price: '1' })] } },
    })
    const store = signedIn()

    const { data } = await store.dispatch(api.endpoints.getAlerts.initiate())

    expect(data.map((a) => a.id)).toEqual([1, 2])
    expect(calls[0].request.headers.get('authorization')).toBe('Token tok')
  })

  it('signs out and wipes the cache when the API answers 401', async () => {
    mockApi({
      'GET /alerts/': () => ({ status: 401, body: { detail: 'Invalid token.' } }),
    })
    const store = signedIn()

    await store.dispatch(api.endpoints.getAlerts.initiate())

    expect(store.getState().auth.token).toBeNull()
    expect(localStorage.getItem('tickr.token')).toBeNull()
    expect(store.getState().api.queries).toEqual({})
  })

  it('joins cached prices to alerts and notifies once when a target is hit', async () => {
    mockApi({
      'GET /alerts/': () => ({
        body: { next: null, results: [makeAlert({ target_price: '70000' })] },
      }),
      'GET /cryptocurrencies/': () => ({ body: [makeCoin({ last_price: '65000' })] }),
    })
    const store = signedIn()

    await store.dispatch(api.endpoints.getAlerts.initiate())
    await store.dispatch(api.endpoints.getCryptocurrencies.initiate())
    expect(selectFeed(store.getState())).toHaveLength(0)
    expect(selectAlertsWithStatus(store.getState())[0]).toMatchObject({
      status: 'watching',
    })

    // Price jumps past the target on the next poll.
    mockApi({
      'GET /cryptocurrencies/': () => ({ body: [makeCoin({ last_price: '71000' })] }),
    })
    await store.dispatch(
      api.endpoints.getCryptocurrencies.initiate(undefined, { forceRefetch: true }),
    )

    expect(selectAlertsWithStatus(store.getState())[0]).toMatchObject({ status: 'hit' })
    const feed = selectFeed(store.getState())
    expect(feed).toHaveLength(1)
    expect(feed[0]).toMatchObject({ id: 'alert-1', kind: 'hit' })
  })

  it('optimistically removes a deleted alert and rolls back on failure', async () => {
    mockApi({
      'GET /alerts/': () => ({ body: { next: null, results: [makeAlert()] } }),
      'DELETE /alerts/1/': () => ({ status: 500, body: { detail: 'boom' } }),
    })
    const store = signedIn()
    await store.dispatch(api.endpoints.getAlerts.initiate())

    await store.dispatch(api.endpoints.deleteAlert.initiate(1))

    expect(selectAlertsWithStatus(store.getState())).toHaveLength(1)
    const toast = Object.values(store.getState().notifications.entities)[0]
    expect(toast).toMatchObject({ kind: 'error' })
  })
})
