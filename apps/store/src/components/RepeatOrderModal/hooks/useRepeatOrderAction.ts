import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getApiErrorMessage, useCart, useRepeatOrder } from '@repo/api'
import type { Order, RepeatOrderResult } from '@repo/domain'
import { routes } from '../../../routes'

type RepeatOrderStage = 'confirm' | 'result'

interface UseRepeatOrderActionParams {
  order: Order
  onClose: () => void
}

export const useRepeatOrderAction = ({ order, onClose }: UseRepeatOrderActionParams) => {
  const navigate = useNavigate()
  const { cart, isLoading: isCartLoading } = useCart()
  const { repeatOrder, isLoading } = useRepeatOrder()
  const [stage, setStage] = useState<RepeatOrderStage>('confirm')
  const [result, setResult] = useState<RepeatOrderResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const activeCartItemCount = cart?.items.reduce((count, item) => count + item.quantity, 0) ?? 0

  const goToCart = useCallback(() => {
    navigate(routes.cart)
    onClose()
  }, [navigate, onClose])

  const confirm = useCallback(async () => {
    setError(null)
    setStage('result')

    try {
      const data = await repeatOrder(order.id)

      if (!data) {
        setError('No pudimos repetir el pedido. Intentá de nuevo en unos instantes.')
        return
      }

      if (data.cart.items.length === 0) {
        setResult(data)
        return
      }

      const hasNotices = data.skippedItems.length > 0 || data.priceChanges.length > 0

      if (!hasNotices) {
        goToCart()
        return
      }

      setResult(data)
    } catch (caught) {
      setResult(null)
      setError(getApiErrorMessage(caught))
    }
  }, [goToCart, order.id, repeatOrder])

  const retry = useCallback(() => {
    setStage('confirm')
    setError(null)
    setResult(null)
  }, [])

  return {
    stage,
    result,
    error,
    isLoading,
    isCartLoading,
    activeCartItemCount,
    confirm,
    retry,
    goToCart,
    dismiss: onClose,
  }
}
