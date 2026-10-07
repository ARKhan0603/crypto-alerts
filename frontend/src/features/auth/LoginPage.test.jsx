import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from '../../App'
import { mockApi } from '../../test/utils'
import { renderWithProviders } from '../../test/render'

afterEach(() => vi.unstubAllGlobals())

describe('auth flow', () => {
  it('redirects anonymous visitors to the login page', () => {
    renderWithProviders(<App />, { route: '/' })
    expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument()
  })

  it('validates required fields before calling the API', async () => {
    const { fetchMock } = mockApi({})
    renderWithProviders(<App />, { route: '/login' })

    await userEvent.click(screen.getByRole('button', { name: /sign in/i }))

    expect(await screen.findByText(/enter your username/i)).toBeInTheDocument()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('shows the server error for bad credentials', async () => {
    mockApi({
      'POST /auth/login/': () => ({
        status: 400,
        body: { non_field_errors: ['Unable to log in with provided credentials.'] },
      }),
    })
    renderWithProviders(<App />, { route: '/login' })

    await userEvent.type(screen.getByLabelText(/username/i), 'ali')
    await userEvent.type(screen.getByLabelText(/password/i), 'wrong')
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/unable to log in/i)
  })

  it('signs in and stores the token', async () => {
    mockApi({ 'POST /auth/login/': () => ({ body: { token: 'abc' } }) })
    const { store } = renderWithProviders(<App />, { route: '/login' })

    await userEvent.type(screen.getByLabelText(/username/i), 'ali')
    await userEvent.type(screen.getByLabelText(/password/i), 'pw')
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => expect(store.getState().auth.token).toBe('abc'))
  })

  it('maps register field errors from the API onto the form', async () => {
    mockApi({
      'POST /auth/register/': () => ({
        status: 400,
        body: { username: ['Username taken.'] },
      }),
    })
    renderWithProviders(<App />, { route: '/register' })

    await userEvent.type(screen.getByLabelText(/username/i), 'ali')
    await userEvent.type(screen.getByLabelText(/email/i), 'a@b.co')
    await userEvent.type(screen.getByLabelText(/password/i), 'longenough1')
    await userEvent.click(screen.getByRole('button', { name: /create account/i }))

    expect(await screen.findByText('Username taken.')).toBeInTheDocument()
  })
})
