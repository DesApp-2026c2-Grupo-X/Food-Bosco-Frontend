import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest'
import { geocodeAddress } from '@repo/api'
import type { Address } from '@repo/domain'
import { AddressSheet } from '../AddressSheet'
import { createTestClient } from '@test/apollo'
import { renderWithProviders } from '@test/utils'

vi.mock('@repo/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@repo/api')>()),
  geocodeAddress: vi.fn(),
}))

const geocodeMock = geocodeAddress as unknown as Mock

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

const editing: Address = { ...rawAddress }

const buildClient = () =>
  createTestClient((operation) => {
    switch (operation.operationName) {
      case 'MyAddresses':
        return { data: { myAddresses: [rawAddress] } }
      default:
        return { data: {} }
    }
  })

const renderSheet = (props: Partial<Parameters<typeof AddressSheet>[0]> = {}) =>
  renderWithProviders(<AddressSheet open mode="manage" onClose={vi.fn()} {...props} />, {
    client: buildClient().client,
  })

describe('AddressSheet', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    geocodeMock.mockResolvedValue({ lat: -34.6, lon: -58.4 })
  })

  it('starts on the form step', () => {
    renderSheet()

    expect(screen.getByRole('heading', { name: 'Cargá tu dirección' })).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Av. Ejemplo 123')).toBeInTheDocument()
  })

  it('prefills the form when editing an address', async () => {
    renderSheet({ editing })

    await waitFor(() =>
      expect(screen.getByPlaceholderText('Av. Ejemplo 123')).toHaveValue('Calle 1'),
    )
    expect(screen.getByRole('heading', { name: 'Editar dirección' })).toBeInTheDocument()
  })

  it('moves to the confirmation step after a successful geocode', async () => {
    renderSheet()

    await userEvent.type(screen.getByPlaceholderText('Av. Ejemplo 123'), 'Av. Corrientes 123')
    const submit = screen.getByRole('button', { name: 'Continuar' })
    await waitFor(() => expect(submit).toBeEnabled())
    await userEvent.click(submit)

    expect(await screen.findByText('¿Es esta tu dirección?')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Confirmar dirección' })).toBeInTheDocument()
  })

  it('returns to the form from the confirmation step', async () => {
    renderSheet()

    await userEvent.type(screen.getByPlaceholderText('Av. Ejemplo 123'), 'Av. Corrientes 123')
    const submit = screen.getByRole('button', { name: 'Continuar' })
    await waitFor(() => expect(submit).toBeEnabled())
    await userEvent.click(submit)

    await screen.findByRole('button', { name: 'Confirmar dirección' })
    await userEvent.click(screen.getByRole('button', { name: 'No es mi dirección' }))

    expect(screen.getByRole('heading', { name: 'Cargá tu dirección' })).toBeInTheDocument()
  })
})
