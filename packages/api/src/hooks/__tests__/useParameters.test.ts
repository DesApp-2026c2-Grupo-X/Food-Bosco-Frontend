import { act, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { FetchResult } from '@apollo/client'
import { useParameters } from '../useParameters'
import { createTestClient, operationVariables } from '@test/apollo'
import { renderHookWithProviders } from '@test/utils'

const rawParameters = [
  { key: 'delivery_fee', value: 500, unit: 'ARS' },
  { key: 'service_fee_pct', value: 10, unit: '%' },
]

const deferred = () => {
  let resolve!: (value: FetchResult) => void
  const promise = new Promise<FetchResult>((res) => {
    resolve = res
  })
  return { promise, resolve }
}

describe('useParameters', () => {
  it('maps the parameter list', async () => {
    const testClient = createTestClient(() => ({ data: { parameters: rawParameters } }))
    const { result } = renderHookWithProviders(() => useParameters(), {
      client: testClient.client,
    })

    await waitFor(() => expect(result.current.parameters).toHaveLength(2))

    expect(result.current.parameters[0]).toEqual({ key: 'delivery_fee', value: 500, unit: 'ARS' })
    expect(result.current.parameters[1].key).toBe('service_fee_pct')
  })

  it('sends the update payload and refetches the list', async () => {
    const testClient = createTestClient((operation) => {
      if (operation.operationName === 'AdminParameters') {
        return { data: { parameters: rawParameters } }
      }
      return { data: { updateParameter: rawParameters[0] } }
    })

    const { result } = renderHookWithProviders(() => useParameters(), {
      client: testClient.client,
    })

    await waitFor(() => expect(result.current.parameters).toHaveLength(2))
    const before = testClient.requestsByName('AdminParameters').length

    await act(async () => {
      await result.current.update('delivery_fee', 750)
    })

    expect(operationVariables(testClient.lastRequest('UpdateParameter'))).toEqual({
      key: 'delivery_fee',
      value: 750,
    })
    expect(testClient.requestsByName('AdminParameters').length).toBeGreaterThan(before)
  })

  it('flags isMutating while the mutation is in flight', async () => {
    const pending = deferred()
    const testClient = createTestClient((operation) => {
      if (operation.operationName === 'UpdateParameter') return pending.promise
      return { data: { parameters: rawParameters } }
    })

    const { result } = renderHookWithProviders(() => useParameters(), {
      client: testClient.client,
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    let request!: Promise<void>
    act(() => {
      request = result.current.update('delivery_fee', 750)
    })

    await waitFor(() => expect(result.current.isMutating).toBe(true))

    await act(async () => {
      pending.resolve({ data: { updateParameter: rawParameters[0] } })
      await request
    })

    expect(result.current.isMutating).toBe(false)
  })
})
