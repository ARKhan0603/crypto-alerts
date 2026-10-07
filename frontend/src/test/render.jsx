import { render } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { createStore } from '../app/store'

export const signedInState = { auth: { token: 'tok', username: 'ali' } }

export function renderWithProviders(ui, { preloadedState, route = '/' } = {}) {
  const store = createStore(preloadedState)
  const result = render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
    </Provider>,
  )
  return { store, ...result }
}
