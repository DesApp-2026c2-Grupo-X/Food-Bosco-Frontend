import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { Route, Routes } from 'react-router-dom'
import { StoreLayout } from '../index'
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

const renderLayout = (route = '/') =>
  renderWithProviders(
    <Routes>
      <Route element={<StoreLayout />}>
        <Route path="/" element={<div>inicio</div>} />
        <Route path="/profile/edit" element={<div>editar</div>} />
      </Route>
    </Routes>,
    { route, client: buildClient() },
  )

describe('StoreLayout', () => {
  beforeEach(() => {
    useAddressStore.setState({ selectedAddressId: null })
  })

  it('clears a stale selection and opens the address modal once addresses load', async () => {
    useAddressStore.setState({ selectedAddressId: 'stale' })
    renderLayout()

    expect(await screen.findByText('¿A dónde te lo llevamos?')).toBeInTheDocument()
    expect(useAddressStore.getState().selectedAddressId).toBeNull()
  })

  it('keeps the modal closed when the selected address is valid', async () => {
    useAddressStore.setState({ selectedAddressId: 'a1' })
    renderLayout()

    expect(await screen.findByText('Calle 1')).toBeInTheDocument()
    expect(screen.queryByText('¿A dónde te lo llevamos?')).not.toBeInTheDocument()
    expect(useAddressStore.getState().selectedAddressId).toBe('a1')
  })

  it('hides the header on back-header paths', async () => {
    useAddressStore.setState({ selectedAddressId: 'a1' })
    const first = renderLayout('/')
    const visibleClass = (first.container.querySelector('header')?.parentElement as HTMLElement)
      .className
    first.unmount()

    const second = renderWithProviders(
      <Routes>
        <Route element={<StoreLayout />}>
          <Route path="/profile/edit" element={<div>editar</div>} />
        </Route>
      </Routes>,
      { route: '/profile/edit', client: buildClient() },
    )
    const hiddenClass = (second.container.querySelector('header')?.parentElement as HTMLElement)
      .className

    expect(visibleClass).not.toBe(hiddenClass)
  })
})
