import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { App } from '../App'
import { useAddressStore } from '../stores/addressStore'
import { useAuthStore } from '@repo/api'
import { createTestClient } from '@test/apollo'
import { renderWithProviders } from '@test/utils'

const rawAddress = {
  id: 'a1',
  label: 'Casa',
  text: 'Calle 1',
  city: 'CABA',
  postalCode: '1425',
  latitude: -34.6,
  longitude: -58.4,
  active: true,
}

const customer = {
  id: 'u1',
  email: 'ana@example.com',
  role: 'customer' as const,
  firstName: 'Ana',
  lastName: 'Perez',
  phone: '123',
  active: true,
  createdAt: '2024-01-01T00:00:00.000Z',
}

const buildClient = (addresses: unknown[] = []) =>
  createTestClient((operation) =>
    operation.operationName === 'MyAddresses' ? { data: { myAddresses: addresses } } : { data: {} },
  ).client

const renderApp = (route: string, addresses: unknown[] = []) =>
  renderWithProviders(<App />, { route, client: buildClient(addresses) })

describe('App routing', () => {
  beforeEach(() => {
    localStorage.clear()
    useAddressStore.setState({ selectedAddressId: null })
    useAuthStore.setState({ user: null, accessToken: null, refreshToken: null, bypassAuth: false })
  })

  it('redirects unauthenticated users to the login screen', async () => {
    renderApp('/')

    expect(await screen.findByText('Ingresá a tu cuenta')).toBeInTheDocument()
  })

  it('renders the store home for an authenticated user with a valid address', async () => {
    useAuthStore.setState({ user: customer })
    useAddressStore.setState({ selectedAddressId: 'a1' })

    renderApp('/', [rawAddress])

    expect(await screen.findByText('¡Hola, Ana!')).toBeInTheDocument()
  })

  it('shows the address picker to an authenticated user without a valid address', async () => {
    useAuthStore.setState({ user: customer })

    renderApp('/', [rawAddress])

    expect(await screen.findByText('¿A dónde te lo llevamos?')).toBeInTheDocument()
  })

  it('redirects a deep-link to a guarded route home when there is no address', async () => {
    useAuthStore.setState({ user: customer })

    renderApp('/catalog', [rawAddress])

    expect(await screen.findByText('¡Hola, Ana!')).toBeInTheDocument()
    expect(await screen.findByText('¿A dónde te lo llevamos?')).toBeInTheDocument()
  })
})
