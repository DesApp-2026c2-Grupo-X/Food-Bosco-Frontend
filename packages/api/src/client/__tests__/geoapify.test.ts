import { afterEach, describe, expect, it, vi } from 'vitest'

const { sharedGeocodeAddress } = vi.hoisted(() => ({ sharedGeocodeAddress: vi.fn() }))

vi.mock('../geo', () => ({ geocodeAddress: sharedGeocodeAddress }))

import { buildLeafletTileUrl, geocodeAddress, isGeocodingEnabled } from '../geoapify'

const configuredKey = () =>
  isGeocodingEnabled ? new URL(buildLeafletTileUrl()).searchParams.get('apiKey') : ''

afterEach(() => {
  vi.unstubAllGlobals()
  sharedGeocodeAddress.mockReset()
})

describe('isGeocodingEnabled', () => {
  it('is enabled exactly when a tile url can be built', () => {
    expect(typeof isGeocodingEnabled).toBe('boolean')
    expect(isGeocodingEnabled).toBe(buildLeafletTileUrl().length > 0)
  })
})

describe('buildLeafletTileUrl', () => {
  it('returns empty strings when no key is configured', () => {
    if (!isGeocodingEnabled) {
      expect(buildLeafletTileUrl()).toBe('')
      expect(buildLeafletTileUrl('dark', true)).toBe('')
    }
  })

  it('builds the default style with the configured key', () => {
    if (!isGeocodingEnabled) return

    expect(buildLeafletTileUrl()).toBe(
      `https://maps.geoapify.com/v1/tile/positron/{z}/{x}/{y}.png?apiKey=${configuredKey()}`,
    )
  })

  it('applies the style and the @2x retina suffix', () => {
    if (!isGeocodingEnabled) return

    expect(buildLeafletTileUrl('dark', true)).toBe(
      `https://maps.geoapify.com/v1/tile/dark/{z}/{x}/{y}@2x.png?apiKey=${configuredKey()}`,
    )
  })
})

describe('geocodeAddress wrapper', () => {
  it('forwards the text and the configured key to the shared geocoder', async () => {
    const coordinates = { lat: 10, lon: 20 }
    sharedGeocodeAddress.mockResolvedValue(coordinates)

    await expect(geocodeAddress('Calle 1 & 2')).resolves.toEqual(coordinates)
    expect(sharedGeocodeAddress).toHaveBeenCalledWith('Calle 1 & 2', configuredKey())
  })
})
