import { vi } from 'vitest'

/**
 * Stub global fetch with route handlers: `{ 'GET /alerts/': (req) => ({ status, body }) }`.
 * Paths are matched against the pathname after `/api/v1`.
 */
export function mockApi(routes) {
  const calls = []
  const fetchMock = vi.fn(async (request) => {
    const url = new URL(request.url)
    const path = url.pathname.replace('/api/v1', '')
    const key = `${request.method} ${path}`
    calls.push({ key, url, request })
    const handler = routes[key]
    if (!handler)
      return new Response(JSON.stringify({ detail: `No mock: ${key}` }), { status: 500 })
    const { status = 200, body } = await handler({ url, request })
    return new Response(body === undefined ? null : JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json' },
    })
  })
  vi.stubGlobal('fetch', fetchMock)
  return { calls, fetchMock }
}

export const makeAlert = (overrides = {}) => ({
  id: 1,
  symbol: 'BTC',
  alert_type: 'above',
  target_price: '70000.00000000',
  is_active: true,
  triggered_at: null,
  created_at: '2026-10-06T10:00:00Z',
  updated_at: '2026-10-06T10:00:00Z',
  ...overrides,
})

export const makeCoin = (overrides = {}) => ({
  symbol: 'BTC',
  name: 'Bitcoin',
  last_price: '65000.00000000',
  last_price_at: '2026-10-07T10:00:00Z',
  ...overrides,
})
