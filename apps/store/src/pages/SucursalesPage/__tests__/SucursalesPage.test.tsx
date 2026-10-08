import { screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { SucursalesPage } from '../index'
import { useAddressStore } from '../../../stores/addressStore'
import { createTestClient, type TestApolloClient } from '@test/apollo'
import { renderWithProviders } from '@test/utils'

const today = new Date().getDay()

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

const openToday = { dayOfWeek: today, opening: '00:00', closing: '23:59', closed: false }

const rawBranch = (overrides: Record<string, unknown> = {}) => ({
  id: 'b1',
  name: 'Centro',
  addressText: 'Av. Central 100',
  latitude: -34.6,
  longitude: -58.4,
  phone: '4321',
  active: true,
  hours: [openToday],
  ...overrides,
})

const buildClient = (branches: unknown[]) =>
  createTestClient((operation) => {
    switch (operation.operationName) {
      case 'MyAddresses':
        return { data: { myAddresses: [rawAddress] } }
      case 'NearbyBranches':
        return { data: { nearbyBranches: branches } }
      default:
        return { data: {} }
    }
  })

const renderPage = (client: TestApolloClient) =>
  renderWithProviders(<SucursalesPage />, { client: client.client })

describe('SucursalesPage', () => {
  beforeEach(() => {
    useAddressStore.setState({ selectedAddressId: 'a1' })
  })

  it('marks the open branch as yours and shows its phone and today hours', async () => {
    renderPage(buildClient([rawBranch()]))

    expect(await screen.findByText('Centro')).toBeInTheDocument()
    expect(screen.getByText('Tu sucursal')).toBeInTheDocument()
    expect(screen.getByText('Abierta')).toBeInTheDocument()
    expect(screen.getByText('4321')).toBeInTheDocument()
    expect(screen.getByText('Hoy: 00:00 a 23:59')).toBeInTheDocument()
  })

  it('only renders the phone for branches that have one', async () => {
    renderPage(
      buildClient([
        rawBranch({ id: 'b1', name: 'Centro', phone: '4321' }),
        rawBranch({ id: 'b2', name: 'Norte', phone: null }),
      ]),
    )

    expect(await screen.findByText('Centro')).toBeInTheDocument()
    expect(screen.getByText('Norte')).toBeInTheDocument()
    expect(screen.getAllByText('4321')).toHaveLength(1)
  })

  it('shows a closed branch as closed', async () => {
    renderPage(
      buildClient([
        rawBranch({
          hours: [{ dayOfWeek: today, opening: null, closing: null, closed: true }],
        }),
      ]),
    )

    expect(await screen.findByText('Cerrada')).toBeInTheDocument()
    expect(screen.getByText('Hoy: Cerrada')).toBeInTheDocument()
    expect(screen.queryByText('Tu sucursal')).not.toBeInTheDocument()
  })

  it('does not keep showing the empty state once the nearby query is loading', async () => {
    const client = createTestClient((operation) => {
      if (operation.operationName === 'MyAddresses') {
        return { data: { myAddresses: [rawAddress] } }
      }
      if (operation.operationName === 'NearbyBranches') {
        return new Promise<never>(() => {})
      }
      return { data: {} }
    })

    renderPage(client)

    expect(screen.getByText('Sucursales')).toBeInTheDocument()
    await waitFor(() => expect(screen.queryByText('Sin sucursales')).not.toBeInTheDocument())
  })

  it('shows the empty state when there are no branches', async () => {
    useAddressStore.setState({ selectedAddressId: null })

    renderPage(buildClient([]))

    expect(await screen.findByText('Sin sucursales')).toBeInTheDocument()
  })
})
