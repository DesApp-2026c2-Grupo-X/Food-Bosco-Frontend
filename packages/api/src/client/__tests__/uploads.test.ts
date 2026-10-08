import { afterEach, describe, expect, it, vi } from 'vitest'
import { uploadProductImage } from '../uploads'
import { useAuthStore } from '../../stores/authStore'

interface StubResponse {
  ok: boolean
  status: number
  json?: () => Promise<unknown>
}

const stubFetch = (response: StubResponse) => {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: response.ok,
    status: response.status,
    json: response.json ?? (() => Promise.resolve(null)),
  })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

const file = () => new File(['content'], 'burger.png', { type: 'image/png' })

afterEach(() => {
  vi.unstubAllGlobals()
  useAuthStore.setState({ accessToken: null })
})

describe('uploadProductImage', () => {
  it('returns the uploaded url and uses the bearer header when a token exists', async () => {
    const fetchMock = stubFetch({
      ok: true,
      status: 200,
      json: async () => ({ url: 'https://cdn/x.png' }),
    })
    useAuthStore.setState({ accessToken: 'tok' })

    await expect(uploadProductImage(file())).resolves.toBe('https://cdn/x.png')

    const [url, init] = fetchMock.mock.calls[0] ?? []
    expect(String(url)).toContain('/v1/uploads')
    expect(init).toMatchObject({ method: 'POST', headers: { authorization: 'Bearer tok' } })
    expect(init?.body).toBeInstanceOf(FormData)
  })

  it('omits the bearer header when there is no token', async () => {
    const fetchMock = stubFetch({
      ok: true,
      status: 200,
      json: async () => ({ url: 'https://cdn/x.png' }),
    })
    useAuthStore.setState({ accessToken: null })

    await uploadProductImage(file())

    expect(fetchMock.mock.calls[0]?.[1]?.headers).toBeUndefined()
  })

  it.each([
    [400, 'Seleccioná una imagen para subir.'],
    [403, 'No tenés permisos para subir imágenes.'],
    [413, 'La imagen supera el tamaño máximo permitido.'],
    [415, 'Formato no permitido. Usá JPG, PNG, WEBP o GIF.'],
    [502, 'No se pudo subir la imagen. Intentá de nuevo en unos minutos.'],
  ])('maps status %i to its exact message', async (status, message) => {
    stubFetch({ ok: false, status, json: async () => ({ message: 'from payload' }) })

    await expect(uploadProductImage(file())).rejects.toThrow(message)
  })

  it('falls back to the payload message for an unknown status', async () => {
    stubFetch({ ok: false, status: 500, json: async () => ({ message: 'boom' }) })

    await expect(uploadProductImage(file())).rejects.toThrow('boom')
  })

  it('falls back to the generic message when an unknown status has no payload message', async () => {
    stubFetch({ ok: false, status: 500, json: async () => ({}) })

    await expect(uploadProductImage(file())).rejects.toThrow('No se pudo subir la imagen.')
  })

  it('handles a non-JSON error body', async () => {
    stubFetch({ ok: false, status: 500, json: () => Promise.reject(new Error('not json')) })

    await expect(uploadProductImage(file())).rejects.toThrow('No se pudo subir la imagen.')
  })

  it('throws when the ok response has no url', async () => {
    stubFetch({ ok: true, status: 200, json: async () => ({}) })

    await expect(uploadProductImage(file())).rejects.toThrow(
      'La respuesta de la subida no incluyó una URL.',
    )
  })
})
