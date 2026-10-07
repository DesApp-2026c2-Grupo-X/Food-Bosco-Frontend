import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Address } from '@repo/domain'
import { AddressesPage } from '../index'
import { useAddressStore } from '../../../stores/addressStore'
import { renderWithProviders } from '@test/utils'

const api = vi.hoisted(() => ({
  useAddresses: vi.fn(),
  geocodeAddress: vi.fn(),
}))

vi.mock('@repo/api', () => ({
  useAddresses: api.useAddresses,
  geocodeAddress: api.geocodeAddress,
  buildLeafletTileUrl: () => null,
}))

const address = (overrides: Partial<Address> = {}): Address => ({
  id: 'a1',
  label: 'Casa',
  text: 'Calle 1',
  city: 'CABA',
  postalCode: '1425',
  latitude: -34.6,
  longitude: -58.4,
  active: true,
  ...overrides,
})

interface ResourceOverrides {
  addresses?: Address[]
  create?: (input: unknown) => Promise<Address | null>
  update?: (id: string, input: unknown) => Promise<void>
  remove?: (id: string) => Promise<void>
}

const setup = ({
  addresses = [],
  create = vi.fn().mockResolvedValue(address({ id: 'new1' })),
  update = vi.fn().mockResolvedValue(undefined),
  remove = vi.fn().mockResolvedValue(undefined),
}: ResourceOverrides = {}) => {
  api.useAddresses.mockReturnValue({
    addresses,
    isLoading: false,
    create,
    update,
    remove,
  })
  return { create, update, remove, ...renderWithProviders(<AddressesPage />) }
}

const continueButton = () => screen.getByRole('button', { name: 'Continuar' })

describe('AddressesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAddressStore.setState({ selectedAddressId: null })
    api.geocodeAddress.mockResolvedValue({ lat: -34.6, lon: -58.4 })
  })

  it('shows the empty state when there are no addresses', () => {
    setup()
    expect(screen.getByText('Sin direcciones guardadas')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Agregar dirección/ })).toBeInTheDocument()
  })

  it('lists the addresses and selects one from the card', async () => {
    useAddressStore.setState({ selectedAddressId: 'a1' })
    setup({ addresses: [address(), address({ id: 'a2', label: 'Trabajo', text: 'Calle 2' })] })

    expect(screen.getByText('Casa')).toBeInTheDocument()
    expect(screen.getByText('Trabajo')).toBeInTheDocument()
    expect(screen.getByText('Actual')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Usar esta' }))

    expect(useAddressStore.getState().selectedAddressId).toBe('a2')
  })

  it('creates an address through the form and confirmation step', async () => {
    const { create } = setup()

    await userEvent.click(screen.getByRole('button', { name: /Agregar dirección/ }))

    await userEvent.type(
      await screen.findByPlaceholderText('Av. Ejemplo 123'),
      'Av. Corrientes 123',
    )
    await waitFor(() => expect(continueButton()).toBeEnabled())
    await userEvent.click(continueButton())

    expect(api.geocodeAddress).toHaveBeenCalledWith('Av. Corrientes 123')

    await userEvent.click(await screen.findByRole('button', { name: 'Confirmar dirección' }))

    await waitFor(() =>
      expect(create).toHaveBeenCalledWith(
        expect.objectContaining({
          text: 'Av. Corrientes 123',
          latitude: -34.6,
          longitude: -58.4,
        }),
      ),
    )
    expect(useAddressStore.getState().selectedAddressId).toBe('new1')
  })

  it('edits an existing address with the prefilled form', async () => {
    const { update } = setup({ addresses: [address()] })

    await userEvent.click(screen.getByRole('button', { name: 'Editar' }))

    const street = await screen.findByPlaceholderText('Av. Ejemplo 123')
    expect(street).toHaveValue('Calle 1')

    await userEvent.clear(street)
    await userEvent.type(street, 'Calle 99')
    await waitFor(() => expect(continueButton()).toBeEnabled())
    await userEvent.click(continueButton())

    await userEvent.click(await screen.findByRole('button', { name: 'Confirmar dirección' }))

    await waitFor(() =>
      expect(update).toHaveBeenCalledWith(
        'a1',
        expect.objectContaining({ text: 'Calle 99', latitude: -34.6, longitude: -58.4 }),
      ),
    )
  })

  it('removes an address and clears the selection when it was selected', async () => {
    useAddressStore.setState({ selectedAddressId: 'a1' })
    const { remove } = setup({ addresses: [address()] })

    await userEvent.click(screen.getByRole('button', { name: /Eliminar/ }))

    await waitFor(() => expect(remove).toHaveBeenCalledWith('a1'))
    expect(useAddressStore.getState().selectedAddressId).toBeNull()
  })

  it('shows an error when the address cannot be geocoded', async () => {
    api.geocodeAddress.mockResolvedValue(null)
    const { create } = setup()

    await userEvent.click(screen.getByRole('button', { name: /Agregar dirección/ }))
    await userEvent.type(
      await screen.findByPlaceholderText('Av. Ejemplo 123'),
      'Direccion inexistente',
    )
    await waitFor(() => expect(continueButton()).toBeEnabled())
    await userEvent.click(continueButton())

    expect(
      await screen.findByText('No pudimos ubicar esa dirección. Revisá los datos.'),
    ).toBeInTheDocument()
    expect(continueButton()).toBeInTheDocument()
    expect(create).not.toHaveBeenCalled()
  })
})
