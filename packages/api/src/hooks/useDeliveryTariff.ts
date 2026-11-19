import { useCallback } from 'react'
import { useMutation, useQuery } from '@apollo/client'
import { DELIVERY_TARIFF_CURRENCY, type DeliveryTariff } from '@repo/domain'
import {
  ADMIN_DELIVERY_TARIFF,
  ADMIN_DELIVERY_TARIFFS,
  PUBLISH_DELIVERY_TARIFF,
  toDeliveryTariff,
} from '../client/admin'

export interface PublishDeliveryTariffVariables {
  baseFare: number
  perKm: number
  perOrder: number
  currency?: string
}

interface DeliveryTariffResult {
  deliveryTariff: Record<string, unknown> | null
}

interface DeliveryTariffsResult {
  deliveryTariffs: Record<string, unknown>[]
}

export interface UseDeliveryTariffReturn {
  data: DeliveryTariff | null
  history: DeliveryTariff[]
  loading: boolean
  error: unknown
  isPublishing: boolean
  publish: (input: PublishDeliveryTariffVariables) => Promise<void>
  retry: () => Promise<void>
}

const HISTORY_LIMIT = 20

export const useDeliveryTariff = (): UseDeliveryTariffReturn => {
  const {
    data: activeData,
    loading: activeLoading,
    error: activeError,
    refetch: refetchActive,
  } = useQuery<DeliveryTariffResult>(ADMIN_DELIVERY_TARIFF, {
    fetchPolicy: 'network-only',
  })

  const {
    data: historyData,
    loading: historyLoading,
    error: historyError,
    refetch: refetchHistory,
  } = useQuery<DeliveryTariffsResult>(ADMIN_DELIVERY_TARIFFS, {
    variables: { limit: HISTORY_LIMIT },
    fetchPolicy: 'network-only',
  })

  const [publishMutation, { loading: isPublishing, error: publishError }] =
    useMutation(PUBLISH_DELIVERY_TARIFF)

  const publish = useCallback(
    async (input: PublishDeliveryTariffVariables) => {
      await publishMutation({
        variables: { input: { ...input, currency: DELIVERY_TARIFF_CURRENCY } },
      })
      await Promise.all([refetchActive(), refetchHistory()])
    },
    [publishMutation, refetchActive, refetchHistory],
  )

  const retry = useCallback(async () => {
    await Promise.all([refetchActive(), refetchHistory()])
  }, [refetchActive, refetchHistory])

  return {
    data: activeData?.deliveryTariff ? toDeliveryTariff(activeData.deliveryTariff) : null,
    history: (historyData?.deliveryTariffs ?? []).map(toDeliveryTariff),
    loading: activeLoading || historyLoading,
    error: activeError ?? historyError ?? publishError,
    isPublishing,
    publish,
    retry,
  }
}
