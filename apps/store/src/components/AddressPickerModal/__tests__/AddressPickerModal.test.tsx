import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest'
import { geocodeAddress } from '@repo/api'
import { AddressPickerModal } from '../index'
import { useAddressStore } from '../../../stores/addressStore'
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

const buildClient = () =>
  createTestClient((operation) => {
    switch (operation.operationName) {
      case 'MyAddresses':
        return { data: { myAddresses: [rawAddress] } }
      case 'CreateAddress':
        return { data: { createAddress: { ...rawAddress, id: 'a2', text: 'Calle nueva' } } }
      default:
        return { data: {} }
    }
  })

const renderModal = (props: { onClose?: () => void; closable?: boolean } = {}) => {
  const onClose = props.onClose ?? vi.fn()
  const client = buildClient()
  const utils = renderWithProviders(
    <AddressPickerModal open={false} onClose={onClose} closable={props.closable} />,
    { client: client.client },
  )

  const open = async () => {
    await waitFor(() => expect(client.requestsByName('MyAddresses')).toHaveLength(1))
    utils.rerender(<AddressPickerModal open onClose={onClose} closable={props.closable} />)
    await screen.findByText('¿A dónde te lo llevamos?')
  }

  return { ...utils, onClose, open }
}

describe('AddressPickerModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAddressStore.setState({ selectedAddressId: null })
    geocodeMock.mockResolvedValue({ lat: -34.6, lon: -58.4 })
  })

  it('lists the saved addresses', async () => {
    const { open } = renderModal()
    await open()

    expect(await screen.findByText('¿A dónde te lo llevamos?')).toBeInTheDocument()
    expect(screen.getByText('Casa')).toBeInTheDocument()
    expect(screen.getByText('Calle 1')).toBeInTheDocument()
  })

  it('selects an address and closes the modal', async () => {
    const { open, onClose } = renderModal()
    await open()

    await userEvent.click(screen.getByRole('button', { name: /Casa/ }))

    expect(useAddressStore.getState().selectedAddressId).toBe('a1')
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('opens the form when adding a new address', async () => {
    const { open } = renderModal()
    await open()

    await userEvent.click(screen.getByRole('button', { name: /Agregar nueva dirección/ }))

    expect(screen.getByRole('heading', { name: 'Cargá tu dirección' })).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Av. Ejemplo 123')).toBeInTheDocument()
  })

  it('prevents dismissal when not closable', async () => {
    const onClose = vi.fn()
    const { open } = renderModal({ onClose, closable: false })
    await open()

    expect(document.querySelector('[data-part="close-trigger"]')).toBeNull()
    await userEvent.keyboard('{Escape}')
    expect(onClose).not.toHaveBeenCalled()
  })

  it('closes through onSaved after creating an address', async () => {
    const { open, onClose } = renderModal()
    await open()

    await userEvent.click(screen.getByRole('button', { name: /Agregar nueva dirección/ }))
    await userEvent.type(screen.getByPlaceholderText('Av. Ejemplo 123'), 'Calle nueva')

    const submit = screen.getByRole('button', { name: 'Continuar' })
    await waitFor(() => expect(submit).toBeEnabled())
    await userEvent.click(submit)

    await userEvent.click(await screen.findByRole('button', { name: 'Confirmar dirección' }))

    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1))
  })
})
