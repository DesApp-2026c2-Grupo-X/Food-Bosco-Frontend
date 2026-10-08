import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest'
import { geocodeAddress } from '@repo/api'
import { geocodeAddress as sharedGeocodeAddress } from '../../../../../packages/api/src/client/geo'

vi.mock('../../../../../packages/api/src/client/geo', () => ({
  geocodeAddress: vi.fn(),
}))

const sharedMock = sharedGeocodeAddress as unknown as Mock

describe('geocodeAddress (store)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('forwards the query and the configured key and returns the coordinates', async () => {
    sharedMock.mockResolvedValue({ lat: -34.6, lon: -58.4 })

    await expect(geocodeAddress('Av. Corrientes 123')).resolves.toEqual({
      lat: -34.6,
      lon: -58.4,
    })

    expect(sharedMock).toHaveBeenCalledWith('Av. Corrientes 123', '')
  })

  it('returns null when the query has no results', async () => {
    sharedMock.mockResolvedValue(null)

    await expect(geocodeAddress('')).resolves.toBeNull()

    expect(sharedMock).toHaveBeenCalledWith('', '')
  })

  it('returns null when the geocoder fails', async () => {
    sharedMock.mockResolvedValue(null)

    await expect(geocodeAddress('Calle 1')).resolves.toBeNull()
  })

  it('returns null when the configured api key is missing', async () => {
    sharedMock.mockResolvedValue(null)

    await expect(geocodeAddress('Calle 1')).resolves.toBeNull()

    expect(sharedMock).toHaveBeenCalledWith('Calle 1', '')
  })
})
