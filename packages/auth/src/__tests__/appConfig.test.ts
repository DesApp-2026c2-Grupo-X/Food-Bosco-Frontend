import { afterEach, describe, expect, it, vi } from 'vitest'

const importConfig = async () => {
  vi.resetModules()
  return import('../appConfig')
}

afterEach(() => {
  vi.unstubAllEnvs()
  vi.resetModules()
})

describe('createAppConfig', () => {
  it('falls back to the local URLs when the env vars are missing', async () => {
    vi.stubEnv('VITE_BRANCH_URL', undefined)
    vi.stubEnv('VITE_ADMIN_URL', undefined)
    vi.stubEnv('VITE_RIDER_URL', undefined)

    const { createAppConfig } = await importConfig()

    expect(createAppConfig({ self: 'store' })).toEqual({
      BRANCH_URL: 'http://localhost:5175',
      ADMIN_URL: 'http://localhost:5174',
      RIDER_URL: 'http://localhost:5176',
      MOCK_AUTH: false,
    })
  })

  it('reads the URLs from the environment', async () => {
    vi.stubEnv('VITE_BRANCH_URL', 'https://branch.example')
    vi.stubEnv('VITE_ADMIN_URL', 'https://admin.example')
    vi.stubEnv('VITE_RIDER_URL', 'https://rider.example')

    const { createAppConfig } = await importConfig()

    expect(createAppConfig({ self: 'admin' })).toMatchObject({
      BRANCH_URL: 'https://branch.example',
      ADMIN_URL: 'https://admin.example',
      RIDER_URL: 'https://rider.example',
    })
  })

  it('enables MOCK_AUTH only for the literal "true"', async () => {
    vi.stubEnv('VITE_MOCK_AUTH', 'true')
    const withTrue = await importConfig()
    expect(withTrue.createAppConfig({ self: 'store' }).MOCK_AUTH).toBe(true)

    vi.stubEnv('VITE_MOCK_AUTH', 'false')
    const withFalse = await importConfig()
    expect(withFalse.createAppConfig({ self: 'store' }).MOCK_AUTH).toBe(false)

    vi.stubEnv('VITE_MOCK_AUTH', '1')
    const withOne = await importConfig()
    expect(withOne.createAppConfig({ self: 'store' }).MOCK_AUTH).toBe(false)
  })
})
