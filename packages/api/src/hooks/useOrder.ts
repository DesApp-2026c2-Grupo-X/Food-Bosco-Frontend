import useSWR from "swr"
import type { Order } from "@repo/domain"
import { getJson } from "../client/rest"
import { getOrderById } from "../mocks/orders"

interface UseOrderReturn {
  order: Order | null
  isLoading: boolean
}

export const useOrder = (orderId: string | undefined): UseOrderReturn => {
  const { data, isLoading } = useSWR<Order | null>(
    orderId ? `/api/orders/${orderId}` : null,
    async (url: string) => {
      const json = await getJson<Order>(url)
      if (json && typeof json === "object" && "id" in json) {
        return json
      }
      return orderId ? getOrderById(orderId) : null
    },
  )

  return { order: data ?? null, isLoading }
}
