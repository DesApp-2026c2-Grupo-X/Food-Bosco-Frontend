import { act, fireEvent, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { geocodeAddress, useBranches } from '@repo/api'
import { renderWithProviders } from '@test/utils'
import { BranchEditPage } from '../index'

vi.mock('@repo/api', () => ({
  useBranches: vi.fn(),
  geocodeAddress: vi.fn(),
  buildLeafletTileUrl: vi.fn(() => ''),
}))

const LOCATION_ERROR = 'No pudimos ubicar esa dirección. Ingresá las coordenadas a mano.'

const mockBranches = () =>
  vi.mocked(useBranches).mockReturnValue({
    branches: [],
    isLoading: false,
    isMutating: false,
    create: vi.fn(),
    update: vi.fn(),
    toggle: vi.fn(),
    saveHours: vi.fn(),
  } as ReturnType<typeof useBranches>)

const renderNew = () =>
  renderWithProviders(
    <Routes>
      <Route path="/branches/new" element={<BranchEditPage />} />
    </Routes>,
    { route: '/branches/new' },
  )

describe('BranchEditPage geocoding', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('auto-geocodes a debounced address change and fills the coordinates', async () => {
    vi.useFakeTimers()
    const geocode = vi.mocked(geocodeAddress).mockResolvedValue({ lat: -34.5, lon: -58.5 })
    mockBranches()
    renderNew()

    fireEvent.change(screen.getByLabelText('Dirección'), { target: { value: 'Av. Vergara 1200' } })

    expect(geocode).not.toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(500)
    })
    expect(geocode).not.toHaveBeenCalled()

    await act(async () => {
      vi.advanceTimersByTime(100)
    })

    expect(geocode).toHaveBeenCalledWith('Av. Vergara 1200')
    expect(screen.getByLabelText('Latitud')).toHaveValue('-34.5')
    expect(screen.getByLabelText('Longitud')).toHaveValue('-58.5')
  })

  it('shows an error when the address cannot be geocoded', async () => {
    vi.useFakeTimers()
    vi.mocked(geocodeAddress).mockResolvedValue(null)
    mockBranches()
    renderNew()

    fireEvent.change(screen.getByLabelText('Dirección'), { target: { value: 'Av. Vergara 1200' } })

    await act(async () => {
      vi.advanceTimersByTime(600)
    })

    expect(screen.getByText(LOCATION_ERROR)).toBeInTheDocument()
  })

  it('ignores the manual button when the address is too short', async () => {
    const geocode = vi.mocked(geocodeAddress).mockResolvedValue({ lat: -34.5, lon: -58.5 })
    mockBranches()
    renderNew()

    fireEvent.change(screen.getByLabelText('Dirección'), { target: { value: 'Casa' } })
    await userEvent.click(screen.getByRole('button', { name: 'Ubicar en el mapa' }))

    expect(geocode).not.toHaveBeenCalled()
  })

  it('shows an error when the geocoding request throws', async () => {
    vi.mocked(geocodeAddress).mockRejectedValue(new Error('network down'))
    mockBranches()
    renderNew()

    fireEvent.change(screen.getByLabelText('Dirección'), { target: { value: 'Av. Vergara 1200' } })
    await userEvent.click(screen.getByRole('button', { name: 'Ubicar en el mapa' }))

    expect(await screen.findByText(LOCATION_ERROR)).toBeInTheDocument()
  })
})
