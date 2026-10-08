import { fireEvent, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { StoreHeader } from '../index'
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

const buildClient = (addresses: unknown[] = [rawAddress]) =>
  createTestClient((operation) =>
    operation.operationName === 'MyAddresses' ? { data: { myAddresses: addresses } } : { data: {} },
  ).client

const renderHeader = (route = '/', onOpenLocation = vi.fn(), addresses: unknown[] = [rawAddress]) =>
  renderWithProviders(<StoreHeader count={0} onOpenLocation={onOpenLocation} />, {
    route,
    client: buildClient(addresses),
  })

const locationButton = () =>
  screen.getByRole('button', { name: /Dirección de entrega/, hidden: true })

describe('StoreHeader', () => {
  beforeEach(() => {
    useAddressStore.setState({ selectedAddressId: null })
  })

  it('shows the selected address text', async () => {
    useAddressStore.setState({ selectedAddressId: 'a1' })
    renderHeader()

    expect(await screen.findByText('Calle 1')).toBeInTheDocument()
  })

  it('falls back to the placeholder when there is no valid selection', async () => {
    renderHeader('/', vi.fn(), [])

    expect(await screen.findByText('Elegí tu dirección')).toBeInTheDocument()
  })

  it('calls onOpenLocation when the location button is clicked', async () => {
    const onOpenLocation = vi.fn()
    useAddressStore.setState({ selectedAddressId: 'a1' })
    renderHeader('/', onOpenLocation)

    await userEvent.click(await screen.findByRole('button', { name: /Dirección de entrega/ }))

    expect(onOpenLocation).toHaveBeenCalledTimes(1)
  })

  it('opens the cart drawer from the cart button', async () => {
    useAddressStore.setState({ selectedAddressId: 'a1' })
    renderHeader()

    expect(screen.queryByText('Mi carrito')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Ver carrito', hidden: true }))

    expect(await screen.findByText('Mi carrito')).toBeInTheDocument()
  })

  it('only shows the mobile location on home, catalog and cart', async () => {
    useAddressStore.setState({ selectedAddressId: 'a1' })
    const { unmount } = renderHeader('/catalog')
    await waitFor(() => expect(locationButton()).toBeInTheDocument())
    const shownClass = locationButton().parentElement?.className
    unmount()

    renderHeader('/orders')
    const hiddenClass = locationButton().parentElement?.className

    expect(shownClass).not.toBe(hiddenClass)
  })

  it('marks the active desktop nav item', async () => {
    useAddressStore.setState({ selectedAddressId: 'a1' })
    renderHeader('/catalog')

    await screen.findByText('Calle 1')

    const active = (screen.getByText('Catálogo').closest('a') as HTMLElement).className
    const inactive = (screen.getByText('Inicio').closest('a') as HTMLElement).className

    expect(active).not.toBe(inactive)
  })

  it('links to the profile', async () => {
    useAddressStore.setState({ selectedAddressId: 'a1' })
    renderHeader()

    await screen.findByText('Calle 1')

    expect(screen.getByRole('link', { name: 'Perfil', hidden: true })).toHaveAttribute(
      'href',
      '/profile',
    )
  })
})
