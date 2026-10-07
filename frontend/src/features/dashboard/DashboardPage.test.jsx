import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { makeAlert, makeCoin, mockApi } from '../../test/utils'
import { renderWithProviders, signedInState } from '../../test/render'
import DashboardPage from './DashboardPage'

afterEach(() => vi.unstubAllGlobals())

const coins = [
  makeCoin(),
  makeCoin({ symbol: 'ETH', name: 'Ethereum', last_price: '3400' }),
]

const alerts = []

function setup(routes = {}) {
  alerts.splice(0, alerts.length, makeAlert({ id: 1, target_price: '60000' })) // BTC 65k ≥ 60k → hit
  const api = mockApi({
    'GET /cryptocurrencies/': () => ({ body: coins }),
    'GET /alerts/': () => ({ body: { next: null, results: alerts } }),
    ...routes,
  })
  const view = renderWithProviders(<DashboardPage />, { preloadedState: signedInState })
  return { ...api, ...view }
}

describe('DashboardPage', () => {
  it('renders live prices and flags an alert whose target was hit', async () => {
    setup()

    expect(
      await screen.findByRole('article', { name: /bitcoin price/i }),
    ).toHaveTextContent('$65,000.00')
    expect(await screen.findByText('Target hit')).toBeInTheDocument()
    expect(screen.getByText(/1 hit/i, { selector: 'header span' })).toBeInTheDocument()
    expect(await screen.findByRole('status')).toHaveTextContent(/BTC went above/i)
    expect(
      screen.getByRole('button', { name: /notifications, 1 unread/i }),
    ).toBeInTheDocument()
  })

  it('creates an alert through the form and sends a normalised payload', async () => {
    const created = []
    const { calls } = setup({
      'POST /alerts/': async ({ request }) => {
        created.push(await request.clone().json())
        return {
          status: 201,
          body: makeAlert({ id: 2, symbol: 'ETH', target_price: '4000' }),
        }
      },
    })
    await screen.findByRole('article', { name: /ethereum price/i })

    await userEvent.click(screen.getByRole('button', { name: /\+ new alert/i }))
    const dialog = await screen.findByRole('dialog')
    await userEvent.selectOptions(within(dialog).getByLabelText(/cryptocurrency/i), 'ETH')
    await userEvent.click(within(dialog).getByLabelText(/below/i))
    await userEvent.type(within(dialog).getByLabelText(/target price/i), '4000')
    await userEvent.click(within(dialog).getByRole('button', { name: /create alert/i }))

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(created).toEqual([
      { symbol: 'ETH', alert_type: 'below', target_price: '4000', is_active: true },
    ])
    // The mutation invalidated the list tag, so alerts were fetched again.
    await waitFor(() =>
      expect(calls.filter((c) => c.key === 'GET /alerts/').length).toBeGreaterThan(1),
    )
  })

  it('validates the target price client-side', async () => {
    const { calls } = setup()
    await userEvent.click(await screen.findByRole('button', { name: /\+ new alert/i }))
    const dialog = await screen.findByRole('dialog')

    await userEvent.selectOptions(within(dialog).getByLabelText(/cryptocurrency/i), 'BTC')
    await userEvent.type(within(dialog).getByLabelText(/target price/i), '-5')
    await userEvent.click(within(dialog).getByRole('button', { name: /create alert/i }))

    expect(await within(dialog).findByText(/positive number/i)).toBeInTheDocument()
    expect(calls.some((c) => c.key === 'POST /alerts/')).toBe(false)
  })

  it('shows API validation errors on the offending field', async () => {
    setup({
      'POST /alerts/': () => ({
        status: 400,
        body: { target_price: ['Target price must be greater than 0.'] },
      }),
    })
    await userEvent.click(await screen.findByRole('button', { name: /\+ new alert/i }))
    const dialog = await screen.findByRole('dialog')

    await userEvent.selectOptions(within(dialog).getByLabelText(/cryptocurrency/i), 'BTC')
    await userEvent.type(within(dialog).getByLabelText(/target price/i), '10')
    await userEvent.click(within(dialog).getByRole('button', { name: /create alert/i }))

    expect(await within(dialog).findByText(/must be greater than 0/i)).toBeInTheDocument()
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('deletes an alert optimistically', async () => {
    const { calls } = setup({
      'DELETE /alerts/1/': () => {
        alerts.length = 0
        return { status: 204 }
      },
    })

    await userEvent.click(
      await screen.findByRole('button', { name: /delete btc alert/i }),
    )

    await waitFor(() => expect(screen.queryByText('Target hit')).not.toBeInTheDocument())
    expect(calls.some((c) => c.key === 'DELETE /alerts/1/')).toBe(true)
  })

  it('pauses an alert with a PATCH', async () => {
    const patches = []
    setup({
      'PATCH /alerts/1/': async ({ request }) => {
        patches.push(await request.clone().json())
        return { body: makeAlert({ is_active: false }) }
      },
    })

    await userEvent.click(await screen.findByRole('button', { name: /^pause$/i }))

    await waitFor(() => expect(patches).toEqual([{ is_active: false }]))
  })

  it('shows an empty state and a retry on load failure', async () => {
    setup({
      'GET /alerts/': () => ({ status: 500, body: { detail: 'Server exploded' } }),
    })
    expect(await screen.findByText('Server exploded')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument()
  })
})
