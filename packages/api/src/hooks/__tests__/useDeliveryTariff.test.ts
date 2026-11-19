import { act, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useDeliveryTariff } from '../useDeliveryTariff'
import { createTestClient, operationVariables } from '@test/apollo'
import { renderHookWithProviders } from '@test/utils'

const rawTariff = {
  id: 'tar-2',
  baseFare: 600,
  perKm: 250,
  perOrder: 350,
  currency: 'ARS',
  effectiveFrom: '2026-02-01T10:00:00.000Z',
  active: true,
  createdBy: 'admin-1',
  createdAt: '2026-02-01T10:00:00.000Z',
}

const rawHistory = [
  rawTariff,
  {
    ...rawTariff,
    id: 'tar-1',
    baseFare: 500,
    perKm: 200,
    perOrder: 300,
    active: false,
    createdBy: 'system:bootstrap',
  },
]

describe('useDeliveryTariff', () => {
  it('mapea la tarifa activa y el historial', async () => {
    const testClient = createTestClient((operation) => {
      if (operation.operationName === 'AdminDeliveryTariff') {
        return { data: { deliveryTariff: rawTariff } }
      }
      return { data: { deliveryTariffs: rawHistory } }
    })

    const { result } = renderHookWithProviders(() => useDeliveryTariff(), {
      client: testClient.client,
    })

    await waitFor(() => expect(result.current.loading).toBe(false))
    await waitFor(() => expect(result.current.data).not.toBeNull())

    expect(result.current.data).toMatchObject({ id: 'tar-2', baseFare: 600, active: true })
    expect(result.current.history).toHaveLength(2)
    expect(result.current.history[1].createdBy).toBe('system:bootstrap')
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeFalsy()
  })

  it('publica la nueva tarifa y refresca activa e historial', async () => {
    const testClient = createTestClient((operation) => {
      if (operation.operationName === 'AdminDeliveryTariff') {
        return { data: { deliveryTariff: rawTariff } }
      }
      if (operation.operationName === 'AdminDeliveryTariffs') {
        return { data: { deliveryTariffs: rawHistory } }
      }
      return { data: { publishDeliveryTariff: { ...rawTariff, id: 'tar-3', baseFare: 700 } } }
    })

    const { result } = renderHookWithProviders(() => useDeliveryTariff(), {
      client: testClient.client,
    })

    await waitFor(() => expect(result.current.data).not.toBeNull())
    const activeBefore = testClient.requestsByName('AdminDeliveryTariff').length
    const historyBefore = testClient.requestsByName('AdminDeliveryTariffs').length

    await act(async () => {
      await result.current.publish({ baseFare: 700, perKm: 260, perOrder: 360, currency: 'ARS' })
    })

    expect(operationVariables(testClient.lastRequest('PublishDeliveryTariff'))).toEqual({
      input: { baseFare: 700, perKm: 260, perOrder: 360, currency: 'ARS' },
    })
    expect(testClient.requestsByName('AdminDeliveryTariff').length).toBeGreaterThan(activeBefore)
    expect(testClient.requestsByName('AdminDeliveryTariffs').length).toBeGreaterThan(historyBefore)
  })

  it('fuerza la moneda ARS aunque el llamador envíe otra', async () => {
    const testClient = createTestClient((operation) => {
      if (operation.operationName === 'AdminDeliveryTariff') {
        return { data: { deliveryTariff: rawTariff } }
      }
      if (operation.operationName === 'AdminDeliveryTariffs') {
        return { data: { deliveryTariffs: rawHistory } }
      }
      return { data: { publishDeliveryTariff: rawTariff } }
    })

    const { result } = renderHookWithProviders(() => useDeliveryTariff(), {
      client: testClient.client,
    })

    await waitFor(() => expect(result.current.data).not.toBeNull())

    const input = {
      baseFare: 700,
      perKm: 260,
      perOrder: 360,
      currency: 'USD',
    }

    await act(async () => {
      await result.current.publish(input)
    })

    expect(operationVariables(testClient.lastRequest('PublishDeliveryTariff'))).toEqual({
      input: { baseFare: 700, perKm: 260, perOrder: 360, currency: 'ARS' },
    })
  })

  it('expone el error de permisos de la consulta', async () => {
    const testClient = createTestClient(() => new Error('No tenés permisos'))

    const { result } = renderHookWithProviders(() => useDeliveryTariff(), {
      client: testClient.client,
    })

    await waitFor(() => expect(result.current.error).toBeTruthy())
    expect(result.current.data).toBeNull()
    expect(result.current.history).toEqual([])
  })
})
