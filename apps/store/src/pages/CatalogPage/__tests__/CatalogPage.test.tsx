import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { CatalogPage } from '../index'
import { useAddressStore } from '../../../stores/addressStore'
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

const product = (
  id: string,
  categoryId: string,
  name: string,
  price: number,
  available: boolean,
) => ({
  id,
  categoryId,
  name,
  description: '',
  price,
  image: null,
  available,
  configGroups: [],
  recipe: [],
})

const products = [
  product('p1', 'c1', 'Burger', 1000, true),
  product('p2', 'c1', 'Pizza', 1200, true),
  product('p3', 'c2', 'Cola', 500, true),
  product('p4', 'c1', 'Agotado', 100, false),
]

const setup = (branches: unknown[] = [{ id: 'b1', name: 'Centro' }]) => {
  const client = createTestClient((operation) => {
    switch (operation.operationName) {
      case 'MyAddresses':
        return { data: { myAddresses: [rawAddress] } }
      case 'AvailableBranches':
        return { data: { availableBranches: branches } }
      case 'Categories':
        return {
          data: {
            categories: [
              { id: 'c1', name: 'Comida', active: true },
              { id: 'c2', name: 'Bebidas', active: true },
            ],
          },
        }
      case 'Products':
        return { data: { products } }
      default:
        return { data: {} }
    }
  })
  return renderWithProviders(<CatalogPage />, { client: client.client })
}

describe('CatalogPage', () => {
  beforeEach(() => {
    useAddressStore.setState({ selectedAddressId: 'a1' })
  })

  it('lists only available products', async () => {
    setup()
    expect(await screen.findByText('Burger')).toBeInTheDocument()
    expect(screen.getByText('Pizza')).toBeInTheDocument()
    expect(screen.getByText('Cola')).toBeInTheDocument()
    expect(screen.queryByText('Agotado')).not.toBeInTheDocument()
  })

  it('filters products by search text', async () => {
    setup()
    await screen.findByText('Burger')

    await userEvent.type(screen.getByPlaceholderText('Buscar por nombre...'), 'piz')

    await waitFor(() => expect(screen.queryByText('Burger')).not.toBeInTheDocument())
    expect(screen.getByText('Pizza')).toBeInTheDocument()
    expect(screen.queryByText('Cola')).not.toBeInTheDocument()
  })

  it('filters products by category chip', async () => {
    setup()
    await screen.findByText('Burger')

    await userEvent.click(screen.getByRole('button', { name: 'Bebidas' }))

    await waitFor(() => expect(screen.queryByText('Burger')).not.toBeInTheDocument())
    expect(screen.getByText('Cola')).toBeInTheDocument()
  })

  it('shows the unavailable-branch state when no branch covers the zone', async () => {
    setup([])
    await waitFor(() => expect(screen.queryByText('No hay sucursales disponibles')).not.toBeNull())
  })
})
