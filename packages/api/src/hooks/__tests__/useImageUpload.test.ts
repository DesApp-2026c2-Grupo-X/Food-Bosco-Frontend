import { act } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useImageUpload } from '../useImageUpload'
import { createTestClient } from '@test/apollo'
import { renderHookWithProviders } from '@test/utils'

const file = new File(['x'], 'burger.png', { type: 'image/png' })

const uploadResponse = (body: Record<string, unknown>, ok = true, status = 200) => ({
  ok,
  status,
  json: async () => body,
})

const deferred = () => {
  let resolve!: (value: unknown) => void
  const promise = new Promise<unknown>((res) => {
    resolve = res
  })
  return { promise, resolve }
}

const setup = () => {
  const { client } = createTestClient(() => ({ data: {} }))
  return renderHookWithProviders(() => useImageUpload(), { client })
}

describe('useImageUpload', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('toggles isUploading around the request and returns the uploaded url', async () => {
    const pending = deferred()
    const fetchMock = vi.fn().mockReturnValue(pending.promise)
    vi.stubGlobal('fetch', fetchMock)
    const { result } = setup()

    expect(result.current.isUploading).toBe(false)

    let request!: Promise<string>
    act(() => {
      request = result.current.uploadImage(file)
    })

    expect(result.current.isUploading).toBe(true)

    let url = ''
    await act(async () => {
      pending.resolve(uploadResponse({ url: 'https://cdn.local/burger.png' }))
      url = await request
    })

    expect(url).toBe('https://cdn.local/burger.png')
    expect(result.current.isUploading).toBe(false)
    expect(fetchMock).toHaveBeenCalledWith(
      '/v1/uploads',
      expect.objectContaining({ method: 'POST' }),
    )
  })

  it('resets isUploading and rethrows when the upload fails', async () => {
    const fetchMock = vi.fn().mockResolvedValue(uploadResponse({}, false, 403))
    vi.stubGlobal('fetch', fetchMock)
    const { result } = setup()

    let thrown: Error | undefined
    await act(async () => {
      try {
        await result.current.uploadImage(file)
      } catch (error) {
        thrown = error as Error
      }
    })

    expect(thrown?.message).toBe('No tenés permisos para subir imágenes.')
    expect(result.current.isUploading).toBe(false)
    expect(fetchMock).toHaveBeenCalledWith(
      '/v1/uploads',
      expect.objectContaining({ method: 'POST' }),
    )
  })
})
