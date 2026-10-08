import { screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { InteractiveMap } from '../InteractiveMap'
import { buildMarkerIcon } from '../InteractiveMap/markerIcons'
import { renderWithProviders } from '@test/utils'

const mocks = vi.hoisted(() => ({
  loadLeaflet: vi.fn(),
  buildLeafletTileUrl: vi.fn(),
}))

vi.mock('../InteractiveMap/leafletLoader', () => ({ loadLeaflet: mocks.loadLeaflet }))
vi.mock('@repo/api', () => ({ buildLeafletTileUrl: mocks.buildLeafletTileUrl }))

const createLeaflet = () => {
  const layer: { addTo: ReturnType<typeof vi.fn>; clearLayers: ReturnType<typeof vi.fn> } = {
    addTo: vi.fn(() => layer),
    clearLayers: vi.fn(),
  }
  const map = {
    setView: vi.fn(() => map),
    fitBounds: vi.fn(() => map),
    invalidateSize: vi.fn(),
    remove: vi.fn(),
  }
  const marker = vi.fn(() => ({ addTo: vi.fn() }))
  const leaflet = {
    map: vi.fn(() => map),
    tileLayer: vi.fn(() => ({ addTo: vi.fn() })),
    layerGroup: vi.fn(() => layer),
    marker,
    divIcon: vi.fn(() => ({})),
  }
  return { leaflet, map, layer, marker }
}

const center = { latitude: 0, longitude: 0 }

beforeEach(() => {
  mocks.loadLeaflet.mockReset()
  mocks.buildLeafletTileUrl.mockReset()
  mocks.buildLeafletTileUrl.mockReturnValue('https://tiles/{z}/{x}/{y}.png')
})

describe('InteractiveMap', () => {
  it('shows a loading indicator while leaflet loads', () => {
    mocks.loadLeaflet.mockReturnValue(new Promise(() => {}))

    const { container } = renderWithProviders(
      <InteractiveMap center={center} markers={[]} alt="Mapa" plain />,
    )

    expect(container.querySelector('.chakra-spinner')).toBeInTheDocument()
  })

  it('shows the error message when leaflet fails', async () => {
    mocks.loadLeaflet.mockRejectedValue(new Error('load-failed'))

    renderWithProviders(<InteractiveMap center={center} markers={[]} alt="Mapa" plain />)

    expect(await screen.findByText('No pudimos cargar el mapa.')).toBeInTheDocument()
  })

  it('rebuilds markers only when the marker signature changes', async () => {
    const { leaflet, map, layer, marker } = createLeaflet()
    mocks.loadLeaflet.mockResolvedValue(leaflet)
    const markers = [{ latitude: 1, longitude: 2, color: '#ff0000', kind: 'branch' as const }]

    const { rerender } = renderWithProviders(
      <InteractiveMap center={center} markers={markers} alt="Mapa" plain />,
    )

    await waitFor(() => expect(marker).toHaveBeenCalledTimes(1))
    expect(map.setView).toHaveBeenCalledWith([1, 2], 14)

    rerender(<InteractiveMap center={center} markers={markers} alt="Mapa" plain />)
    await Promise.resolve()
    expect(marker).toHaveBeenCalledTimes(1)

    rerender(
      <InteractiveMap
        center={center}
        markers={[{ ...markers[0], color: '#00ff00' }]}
        alt="Mapa"
        plain
      />,
    )

    await waitFor(() => expect(marker).toHaveBeenCalledTimes(2))
    expect(layer.clearLayers).toHaveBeenCalled()
  })

  it('fits bounds for multiple markers', async () => {
    const { leaflet, map, marker } = createLeaflet()
    mocks.loadLeaflet.mockResolvedValue(leaflet)

    renderWithProviders(
      <InteractiveMap
        center={center}
        markers={[
          { latitude: 1, longitude: 2, color: '#f00' },
          { latitude: 3, longitude: 4, color: '#0f0' },
        ]}
        alt="Mapa"
        plain
      />,
    )

    await waitFor(() => expect(marker).toHaveBeenCalledTimes(2))
    expect(map.fitBounds).toHaveBeenCalledWith(
      [
        [1, 2],
        [3, 4],
      ],
      { padding: [48, 48], maxZoom: 16 },
    )
  })

  it('only renders the legend inside the card variant', () => {
    mocks.loadLeaflet.mockReturnValue(new Promise(() => {}))

    const { unmount } = renderWithProviders(
      <InteractiveMap
        center={center}
        markers={[]}
        alt="Mapa"
        plain
        legend={<div>Leyenda</div>}
        note={<div>Nota</div>}
      />,
    )

    expect(screen.queryByText('Leyenda')).not.toBeInTheDocument()
    expect(screen.queryByText('Nota')).not.toBeInTheDocument()
    unmount()

    renderWithProviders(
      <InteractiveMap
        center={center}
        markers={[]}
        alt="Mapa"
        legend={<div>Leyenda</div>}
        note={<div>Nota</div>}
      />,
    )

    expect(screen.getByText('Leyenda')).toBeInTheDocument()
    expect(screen.getByText('Nota')).toBeInTheDocument()
  })
})

describe('buildMarkerIcon', () => {
  it('builds the legacy circular icon without a kind', () => {
    const icon = buildMarkerIcon({ color: '#123456', label: 'AB' })

    expect(icon.iconSize).toEqual([26, 26])
    expect(icon.iconAnchor).toEqual([13, 13])
    expect(icon.html).toContain('#123456')
    expect(icon.html).toContain('AB')
    expect(icon.html).not.toContain('<svg')
  })

  it('builds a pin icon with the glyph for each kind', () => {
    const branch = buildMarkerIcon({ color: '#111111', kind: 'branch' })
    const client = buildMarkerIcon({ color: '#111111', kind: 'client' })
    const rider = buildMarkerIcon({ color: '#111111', kind: 'rider' })

    for (const icon of [branch, client, rider]) {
      expect(icon.iconSize).toEqual([30, 40])
      expect(icon.iconAnchor).toEqual([15, 40])
      expect(icon.html).toContain('<svg')
      expect(icon.html).toContain('#111111')
    }

    expect(branch.html).not.toBe(client.html)
    expect(client.html).not.toBe(rider.html)
  })
})
