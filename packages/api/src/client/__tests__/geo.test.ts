import { afterEach, describe, expect, it, vi } from 'vitest'
import { geocodeAddress } from '../geo'

const stubFetch = (impl: (...args: unknown[]) => unknown) => {
  const fetchMock = vi.fn(impl)
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('geocodeAddress', () => {
  it('returns null without calling fetch when the api key is empty', async () => {
    const fetchMock = stubFetch(() => Promise.resolve({ ok: true }))

    await expect(geocodeAddress('Calle 1', '')).resolves.toBeNull()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('returns null when fetch rejects', async () => {
    stubFetch(() => Promise.reject(new Error('network')))

    await expect(geocodeAddress('Calle 1', 'key')).resolves.toBeNull()
  })

  it('returns null on a non-2xx response', async () => {
    stubFetch(() => Promise.resolve({ ok: false, status: 500 }))

    await expect(geocodeAddress('Calle 1', 'key')).resolves.toBeNull()
  })

  it('returns null when the body is not valid JSON', async () => {
    stubFetch(() =>
      Promise.resolve({ ok: true, json: () => Promise.reject(new Error('bad json')) }),
    )

    await expect(geocodeAddress('Calle 1', 'key')).resolves.toBeNull()
  })

  it('returns null when no result or coordinates are present', async () => {
    stubFetch(() => Promise.resolve({ ok: true, json: async () => ({ results: [] }) }))
    await expect(geocodeAddress('Calle 1', 'key')).resolves.toBeNull()

    stubFetch(() => Promise.resolve({ ok: true, json: async () => ({ results: [{ lat: 1 }] }) }))
    await expect(geocodeAddress('Calle 1', 'key')).resolves.toBeNull()
  })

  it('returns the coordinates of the first result', async () => {
    stubFetch(() =>
      Promise.resolve({ ok: true, json: async () => ({ results: [{ lat: -34.6, lon: -58.4 }] }) }),
    )

    await expect(geocodeAddress('Calle 1', 'key')).resolves.toEqual({ lat: -34.6, lon: -58.4 })
  })

  it('url-encodes the query and forwards the api key', async () => {
    const fetchMock = stubFetch(() =>
      Promise.resolve({ ok: true, json: async () => ({ results: [{ lat: 1, lon: 2 }] }) }),
    )

    await geocodeAddress('Calle 1 & 2', 'secret')

    const url = new URL(String(fetchMock.mock.calls[0]?.[0]))
    expect(url.searchParams.get('text')).toBe('Calle 1 & 2')
    expect(url.searchParams.get('apiKey')).toBe('secret')
  })

  it('restricts the search to Argentina by default', async () => {
    const fetchMock = stubFetch(() =>
      Promise.resolve({ ok: true, json: async () => ({ results: [{ lat: 1, lon: 2 }] }) }),
    )

    await geocodeAddress('Av. Rivadavia 1234, CABA', 'secret')

    const url = new URL(String(fetchMock.mock.calls[0]?.[0]))
    expect(url.searchParams.get('filter')).toBe('countrycode:ar')
  })

  it('accepts another country and omits the filter when empty', async () => {
    const fetchMock = stubFetch(() =>
      Promise.resolve({ ok: true, json: async () => ({ results: [{ lat: 1, lon: 2 }] }) }),
    )

    await geocodeAddress('Calle 1', 'secret', 'uy')
    await geocodeAddress('Calle 1', 'secret', '')

    const withCountry = new URL(String(fetchMock.mock.calls[0]?.[0]))
    const withoutCountry = new URL(String(fetchMock.mock.calls[1]?.[0]))
    expect(withCountry.searchParams.get('filter')).toBe('countrycode:uy')
    expect(withoutCountry.searchParams.has('filter')).toBe(false)
  })
})
