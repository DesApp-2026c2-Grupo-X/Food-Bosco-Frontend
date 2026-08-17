import type { Order } from "@repo/domain"

export const MOCK_ORDERS: Order[] = [
  {
    id: "o-128",
    number: 128,
    createdAt: "2026-08-14T14:02:00",
    status: "ON_THE_WAY",
    total: 16400,
    itemCount: 3,
    branch: "Centro",
    eta: "~35 min",
    deliveryAddress: "Av. Vergara 1234, Hurlingham",
    items: [
      { id: "i-1", name: "Hamburguesa Doble", quantity: 2, unitPrice: 5400 },
      { id: "i-2", name: "Papas Grandes", quantity: 1, unitPrice: 5600 },
    ],
    store: { label: "Sucursal Centro", address: "Av. Vergara 1200, Hurlingham", lat: -34.589, lon: -58.636 },
    client: { label: "Casa", address: "Av. Vergara 1234, Hurlingham", lat: -34.592, lon: -58.646 },
    rider: { name: "Marcos", vehicle: "Moto · HLP 482" },
  },
  {
    id: "o-98",
    number: 98,
    createdAt: "2026-08-10T20:15:00",
    status: "DELIVERED",
    total: 12100,
    itemCount: 2,
    branch: "Centro",
    deliveredAt: "2026-08-10T20:58:00",
    deliveryAddress: "Av. Vergara 1234, Hurlingham",
    items: [
      { id: "i-3", name: "Pizza Muzzarella", quantity: 1, unitPrice: 8900 },
      { id: "i-4", name: "Gaseosa 1.5L", quantity: 1, unitPrice: 3200 },
    ],
    store: { label: "Sucursal Centro", address: "Av. Vergara 1200, Hurlingham", lat: -34.589, lon: -58.636 },
    client: { label: "Casa", address: "Av. Vergara 1234, Hurlingham", lat: -34.592, lon: -58.646 },
  },
  {
    id: "o-75",
    number: 75,
    createdAt: "2026-08-02T13:40:00",
    status: "CANCELLED",
    total: 8900,
    itemCount: 1,
    branch: "Norte",
    cancelReason: "No pudimos comunicarnos con vos para confirmar el pedido.",
    deliveryAddress: "Dr. Vergara 2200, Villa Tesei",
    items: [{ id: "i-5", name: "Lomito Completo", quantity: 1, unitPrice: 8900 }],
    store: { label: "Sucursal Norte", address: "Calle 25 de Mayo 450, Villa Tesei", lat: -34.586, lon: -58.630 },
    client: { label: "Facultad", address: "Dr. Vergara 2200, Villa Tesei", lat: -34.583, lon: -58.624 },
  },
]

export const getOrderById = (id: string): Order | null =>
  MOCK_ORDERS.find((order) => order.id === id) ?? null
