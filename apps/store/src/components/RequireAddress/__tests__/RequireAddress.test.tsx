import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { Route, Routes } from 'react-router-dom'
import { RequireAddress } from '../index'
import { useAddressStore } from '../../../stores/addressStore'
import { renderWithProviders } from '@test/utils'

const renderGuarded = () =>
  renderWithProviders(
    <Routes>
      <Route element={<RequireAddress redirectPath="/" />}>
        <Route path="/catalog" element={<div>contenido protegido</div>} />
      </Route>
      <Route path="/" element={<div>inicio</div>} />
    </Routes>,
    { route: '/catalog' },
  )

describe('RequireAddress', () => {
  beforeEach(() => {
    useAddressStore.setState({ selectedAddressId: null })
  })

  it('redirects to the redirect path when no address is selected', () => {
    renderGuarded()

    expect(screen.getByText('inicio')).toBeInTheDocument()
    expect(screen.queryByText('contenido protegido')).not.toBeInTheDocument()
  })

  it('renders the outlet when an address is selected', () => {
    useAddressStore.setState({ selectedAddressId: 'a1' })
    renderGuarded()

    expect(screen.getByText('contenido protegido')).toBeInTheDocument()
  })
})
