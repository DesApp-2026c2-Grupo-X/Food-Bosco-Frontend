import type { OrderStatus } from "./order"

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "Pendiente",
  CONFIRMED: "Confirmado",
  PREPARING: "En preparación",
  READY_FOR_DELIVERY: "Listo para entregar",
  ON_THE_WAY: "En camino",
  DELIVERED: "Entregado",
  CANCELLED: "Cancelado",
}

export const ORDER_STATUS_PALETTE = {
  PENDING: "yellow",
  CONFIRMED: "blue",
  PREPARING: "orange",
  READY_FOR_DELIVERY: "purple",
  ON_THE_WAY: "blue",
  DELIVERED: "green",
  CANCELLED: "red",
} as const satisfies Record<OrderStatus, string>
