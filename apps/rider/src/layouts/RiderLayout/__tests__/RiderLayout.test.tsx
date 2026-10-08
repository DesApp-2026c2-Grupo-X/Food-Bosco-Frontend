import { screen } from '@testing-library/react'
import { Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest'
import { useAudioUnlock } from '@repo/components'
import { renderWithProviders } from '@test/utils'
import { RiderLayout } from '../index'

vi.mock('../../../components/RiderHeader', () => ({
  RiderHeader: () => <div>Cabecera rider</div>,
}))

vi.mock('../../../components/MobileRiderNavigation', () => ({
  MobileRiderNavigation: () => <div>Navegación móvil</div>,
}))

vi.mock('@repo/components', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@repo/components')>()),
  useAudioUnlock: vi.fn(),
}))

const audioUnlockMock = useAudioUnlock as unknown as Mock

const renderAt = (route: string) =>
  renderWithProviders(
    <Routes>
      <Route element={<RiderLayout />}>
        <Route index element={<div>Contenido inicio</div>} />
        <Route path="/history" element={<div>Contenido historial</div>} />
        <Route path="/profile" element={<div>Contenido perfil</div>} />
        <Route path="/profile/edit" element={<div>Contenido editar</div>} />
        <Route path="/profile/vehicle" element={<div>Contenido vehículo</div>} />
      </Route>
    </Routes>,
    { route },
  )

const headerWrapperClass = (route: string) => {
  const { unmount } = renderAt(route)
  const className = (screen.getByText('Cabecera rider').parentElement as HTMLElement).className
  unmount()
  return className
}

describe('RiderLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('keeps the header visible on the home, history and profile routes', () => {
    const visible = headerWrapperClass('/')

    expect(headerWrapperClass('/history')).toBe(visible)
    expect(headerWrapperClass('/profile')).toBe(visible)
  })

  it('hides the header on the routes that render their own back header', () => {
    const visible = headerWrapperClass('/')

    expect(headerWrapperClass('/profile/edit')).not.toBe(visible)
    expect(headerWrapperClass('/profile/vehicle')).not.toBe(visible)
  })

  it('renders the mobile navigation', () => {
    renderAt('/')

    expect(screen.getByText('Navegación móvil')).toBeInTheDocument()
  })

  it('renders the active route through the outlet', () => {
    renderAt('/history')

    expect(screen.getByText('Contenido historial')).toBeInTheDocument()
  })

  it('unlocks the incoming-order audio', () => {
    renderAt('/')

    expect(audioUnlockMock).toHaveBeenCalledWith('/incomingOrder.mp3')
  })
})
