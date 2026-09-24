import { useState } from 'react'
import type { OrderStatus } from '@repo/domain'
import { useAdminOrder } from '@repo/api'

export const useOrderTransition = (orderId: string | undefined) => {
  const { order, isLoading, isMutating, changeStatus, releaseRider } = useAdminOrder(orderId)
  const [nextStatus, setNextStatus] = useState<OrderStatus | ''>('')
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [releaseConfirmOpen, setReleaseConfirmOpen] = useState(false)

  const requestChange = (status: OrderStatus) => {
    setNextStatus(status)
    setConfirmOpen(true)
  }

  const confirmChange = async () => {
    if (!nextStatus) return
    await changeStatus(nextStatus)
    setConfirmOpen(false)
    setNextStatus('')
  }

  const cancel = () => {
    setConfirmOpen(false)
    setNextStatus('')
  }

  const requestRelease = () => setReleaseConfirmOpen(true)

  const confirmRelease = async () => {
    await releaseRider()
    setReleaseConfirmOpen(false)
  }

  const cancelRelease = () => setReleaseConfirmOpen(false)

  return {
    order,
    isLoading,
    isMutating,
    nextStatus,
    setNextStatus,
    confirmOpen,
    requestChange,
    confirmChange,
    cancel,
    releaseConfirmOpen,
    requestRelease,
    confirmRelease,
    cancelRelease,
  }
}
