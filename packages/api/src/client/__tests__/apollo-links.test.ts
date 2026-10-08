import { gql } from '@apollo/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useAuthStore } from '../../stores/authStore'
import { apolloClient } from '../apollo'

const PING = gql`
  query Ping {
    ping
  }
`

const PONG = gql`
  query Pong {
    pong
  }
`

const fetchMock = vi.fn()

const jsonResponse = (payload: unknown, status = 200) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: { 'content-type': 'application/json' },
  })

const unauthenticated = {
  errors: [{ message: 'Unauthenticated', extensions: { code: 'UNAUTHENTICATED' } }],
}

const forbidden = {
  errors: [{ message: 'Forbidden', extensions: { code: 'FORBIDDEN' } }],
}

const refreshSession = (accessToken: string, refreshToken: string) => ({
  data: { refreshToken: { accessToken, refreshToken } },
})

const parseBody = (init: RequestInit) =>
  JSON.parse(String(init.body ?? '{}')) as { query?: string; operationName?: string }

const requestHeaders = (init: RequestInit) => new Headers(init.headers)

const isRefreshCall = (init: RequestInit) => (parseBody(init).query ?? '').includes('RefreshToken')

const isLogoutCall = (init: RequestInit) => (parseBody(init).query ?? '').includes('Logout')

const fetchCalls = () =>
  fetchMock.mock.calls.map(([url, init]) => ({
    url: String(url),
    init: (init ?? {}) as RequestInit,
  }))

const refreshCalls = () => fetchCalls().filter(({ init }) => isRefreshCall(init))

const runPing = () => apolloClient.query({ query: PING, fetchPolicy: 'no-cache' })

const runPong = () => apolloClient.query({ query: PONG, fetchPolicy: 'no-cache' })

const resetAuth = () =>
  useAuthStore.setState({ user: null, accessToken: null, refreshToken: null, bypassAuth: false })

describe('apollo auth link', () => {
  const originalFetch = globalThis.fetch

  beforeEach(() => {
    fetchMock.mockReset()
    globalThis.fetch = fetchMock as unknown as typeof fetch
    resetAuth()
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  it('injects a Bearer header when an access token exists', async () => {
    useAuthStore.setState({ accessToken: 'access-1' })
    fetchMock.mockResolvedValue(jsonResponse({ data: { ping: 'pong' } }))

    await runPing()

    expect(fetchCalls()).toHaveLength(1)
    expect(requestHeaders(fetchCalls()[0]!.init).get('authorization')).toBe('Bearer access-1')
  })

  it('omits the authorization header when there is no access token', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ data: { ping: 'pong' } }))

    await runPing()

    expect(fetchCalls()).toHaveLength(1)
    expect(requestHeaders(fetchCalls()[0]!.init).get('authorization')).toBeNull()
  })

  it('refreshes once on UNAUTHENTICATED and retries the operation with the new token', async () => {
    useAuthStore.setState({ accessToken: 'old-access', refreshToken: 'refresh-1' })

    let mainCalls = 0
    fetchMock.mockImplementation(async (_url, init) => {
      if (isRefreshCall(init as RequestInit)) {
        return jsonResponse(refreshSession('new-access', 'refresh-2'))
      }
      mainCalls += 1
      return mainCalls === 1
        ? jsonResponse(unauthenticated)
        : jsonResponse({ data: { ping: 'pong' } })
    })

    const result = await runPing()

    expect(result.data).toEqual({ ping: 'pong' })
    expect(refreshCalls()).toHaveLength(1)
    expect(fetchCalls()).toHaveLength(3)
    expect(requestHeaders(fetchCalls()[2]!.init).get('authorization')).toBe('Bearer new-access')
    expect(useAuthStore.getState()).toMatchObject({
      accessToken: 'new-access',
      refreshToken: 'refresh-2',
    })
  })

  it('shares a single refresh request across concurrent UNAUTHENTICATED operations', async () => {
    useAuthStore.setState({ accessToken: 'old-access', refreshToken: 'refresh-1' })

    const firstAttempts = new Set<string>()
    fetchMock.mockImplementation(async (_url, init) => {
      if (isRefreshCall(init as RequestInit)) {
        return jsonResponse(refreshSession('new-access', 'refresh-2'))
      }
      const name = parseBody(init as RequestInit).operationName ?? ''
      if (!firstAttempts.has(name)) {
        firstAttempts.add(name)
        return jsonResponse(unauthenticated)
      }
      return jsonResponse({ data: name === 'Ping' ? { ping: 'pong' } : { pong: 'ping' } })
    })

    const [ping, pong] = await Promise.all([runPing(), runPong()])

    expect(ping.data).toEqual({ ping: 'pong' })
    expect(pong.data).toEqual({ pong: 'ping' })
    expect(refreshCalls()).toHaveLength(1)
  })

  it('logs out and swallows the request when the refresh mutation fails', async () => {
    useAuthStore.setState({
      accessToken: 'old-access',
      refreshToken: 'refresh-1',
      user: { id: 'u1' } as never,
    })

    fetchMock.mockImplementation(async (_url, init) => {
      const current = init as RequestInit
      if (isRefreshCall(current)) {
        return jsonResponse({ errors: [{ message: 'boom' }] }, 500)
      }
      if (isLogoutCall(current)) {
        return jsonResponse({ data: { logout: true } })
      }
      return jsonResponse(unauthenticated)
    })

    await runPing()

    expect(refreshCalls()).toHaveLength(1)
    expect(fetchCalls().some(({ init }) => isLogoutCall(init))).toBe(true)
    expect(useAuthStore.getState()).toMatchObject({
      user: null,
      accessToken: null,
      refreshToken: null,
    })
  })

  it('does not refresh and keeps the session when no refresh token is stored', async () => {
    useAuthStore.setState({ accessToken: 'old-access', refreshToken: null })
    fetchMock.mockResolvedValue(jsonResponse(unauthenticated))

    await runPing()

    expect(refreshCalls()).toHaveLength(0)
    expect(useAuthStore.getState()).toMatchObject({
      accessToken: 'old-access',
      refreshToken: null,
    })
  })

  it('passes non-UNAUTHENTICATED errors through without refreshing', async () => {
    useAuthStore.setState({ accessToken: 'access-1', refreshToken: 'refresh-1' })
    fetchMock.mockResolvedValue(jsonResponse(forbidden))

    await expect(runPing()).rejects.toBeTruthy()

    expect(refreshCalls()).toHaveLength(0)
    expect(fetchCalls()).toHaveLength(1)
  })
})
