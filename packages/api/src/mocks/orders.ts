import type { Order, OrderStatus, OrderStatusHistory } from '@repo/domain'
import { getNextStatuses } from '@repo/domain'

const ago = (minutes: number) => new Date(Date.now() - minutes * 60000).toISOString()

const history = (...entries: [OrderStatus, OrderStatus, string][]): OrderStatusHistory[] =>
  entries.map(([previousStatus, newStatus, changedAt]) => ({
    previousStatus,
    newStatus,
    changedAt,
  }))

const baseItem = (id: string, name: string, quantity: number, unitPrice: number) => ({
  id,
  name,
  quantity,
  unitPrice,
})

export const MOCK_ORDERS: Order[] = [
  {
    id: 'o-128',
    number: 128,
    createdAt: ago(50),
    status: 'ON_THE_WAY',
    total: 16400,
    itemCount: 3,
    branch: 'Centro',
    eta: '~35 min',
    deliveryAddress: 'Av. Vergara 1234, Hurlingham',
    items: [
      baseItem('i-1', 'Hamburguesa Doble', 2, 5400),
      baseItem('i-2', 'Papas Grandes', 1, 5600),
    ],
    store: {
      label: 'Sucursal Centro',
      address: 'Av. Vergara 1200, Hurlingham',
      lat: -34.589,
      lon: -58.636,
    },
    client: { label: 'Casa', address: 'Av. Vergara 1234, Hurlingham', lat: -34.592, lon: -58.646 },
    rider: { name: 'Marcos', vehicle: 'Moto · HLP 482' },
    customer: {
      name: 'Juan Pérez',
      phone: '+54 11 2345 6789',
      email: 'juan.perez@email.com',
    },
    statusHistory: history(
      ['PENDING', 'CONFIRMED', ago(45)],
      ['CONFIRMED', 'PREPARING', ago(35)],
      ['PREPARING', 'READY_FOR_DELIVERY', ago(20)],
      ['READY_FOR_DELIVERY', 'ON_THE_WAY', ago(10)],
    ),
  },
  {
    id: 'o-98',
    number: 98,
    createdAt: ago(60 * 24 * 3),
    status: 'DELIVERED',
    total: 12100,
    itemCount: 2,
    branch: 'Centro',
    deliveredAt: ago(60 * 24 * 3 - 20),
    deliveryAddress: 'Av. Vergara 1234, Hurlingham',
    items: [baseItem('i-3', 'Pizza Muzzarella', 1, 8900), baseItem('i-4', 'Gaseosa 1.5L', 1, 3200)],
    store: {
      label: 'Sucursal Centro',
      address: 'Av. Vergara 1200, Hurlingham',
      lat: -34.589,
      lon: -58.636,
    },
    client: { label: 'Casa', address: 'Av. Vergara 1234, Hurlingham', lat: -34.592, lon: -58.646 },
    customer: {
      name: 'Sofía Ledesma',
      phone: '+54 11 3456 7890',
      email: 'sofia.ledesma@email.com',
    },
    statusHistory: history(
      ['PENDING', 'CONFIRMED', ago(60 * 24 * 3)],
      ['CONFIRMED', 'PREPARING', ago(60 * 24 * 3 - 10)],
      ['PREPARING', 'READY_FOR_DELIVERY', ago(60 * 24 * 3 - 18)],
      ['READY_FOR_DELIVERY', 'ON_THE_WAY', ago(60 * 24 * 3 - 22)],
      ['ON_THE_WAY', 'DELIVERED', ago(60 * 24 * 3 - 20)],
    ),
  },
  {
    id: 'o-75',
    number: 75,
    createdAt: ago(60 * 24 * 7),
    status: 'CANCELLED',
    total: 8900,
    itemCount: 1,
    branch: 'Norte',
    cancelReason: 'No pudimos comunicarnos con vos para confirmar el pedido.',
    deliveryAddress: 'Dr. Vergara 2200, Villa Tesei',
    items: [baseItem('i-5', 'Lomito Completo', 1, 8900)],
    store: {
      label: 'Sucursal Norte',
      address: 'Calle 25 de Mayo 450, Villa Tesei',
      lat: -34.586,
      lon: -58.63,
    },
    client: {
      label: 'Facultad',
      address: 'Dr. Vergara 2200, Villa Tesei',
      lat: -34.583,
      lon: -58.624,
    },
    customer: {
      name: 'Rocío Fernández',
      phone: '+54 11 4567 8901',
      email: 'rocio.fernandez@email.com',
    },
    statusHistory: history(['PENDING', 'CANCELLED', ago(60 * 24 * 7 - 15)]),
  },
  {
    id: 'o-130',
    number: 130,
    createdAt: ago(6),
    status: 'PENDING',
    total: 6500,
    itemCount: 1,
    branch: 'Centro',
    deliveryAddress: 'Av. San Martín 800, Hurlingham',
    items: [baseItem('i-6', 'Hamburguesa Clásica', 1, 6500)],
    store: {
      label: 'Sucursal Centro',
      address: 'Av. Vergara 1200, Hurlingham',
      lat: -34.589,
      lon: -58.636,
    },
    client: {
      label: 'Casa',
      address: 'Av. San Martín 800, Hurlingham',
      lat: -34.595,
      lon: -58.648,
    },
    customer: {
      name: 'Mateo Álvarez',
      phone: '+54 11 5678 9012',
      email: 'mateo.alvarez@email.com',
    },
    statusHistory: [],
  },
  {
    id: 'o-129',
    number: 129,
    createdAt: ago(25),
    status: 'CONFIRMED',
    total: 13700,
    itemCount: 2,
    branch: 'Centro',
    deliveryAddress: 'Calle Alem 450, Hurlingham',
    items: [baseItem('i-7', 'Doble Cheddar', 1, 8900), baseItem('i-8', 'Papas Fritas', 1, 4800)],
    store: {
      label: 'Sucursal Centro',
      address: 'Av. Vergara 1200, Hurlingham',
      lat: -34.589,
      lon: -58.636,
    },
    client: { label: 'Casa', address: 'Calle Alem 450, Hurlingham', lat: -34.588, lon: -58.642 },
    customer: {
      name: 'Valentina Ruiz',
      phone: '+54 11 6789 0123',
      email: 'valentina.ruiz@email.com',
    },
    statusHistory: history(['PENDING', 'CONFIRMED', ago(20)]),
  },
  {
    id: 'o-127',
    number: 127,
    createdAt: ago(40),
    status: 'PREPARING',
    total: 15600,
    itemCount: 3,
    branch: 'Centro',
    deliveryAddress: 'Av. Jauretche 1100, Hurlingham',
    items: [baseItem('i-9', 'Pizza Mozzarella', 1, 7800), baseItem('i-10', 'Gaseosa', 2, 3900)],
    store: {
      label: 'Sucursal Centro',
      address: 'Av. Vergara 1200, Hurlingham',
      lat: -34.589,
      lon: -58.636,
    },
    client: {
      label: 'Casa',
      address: 'Av. Jauretche 1100, Hurlingham',
      lat: -34.587,
      lon: -58.634,
    },
    customer: {
      name: 'Tomás Giménez',
      phone: '+54 11 7890 1234',
      email: 'tomas.gimenez@email.com',
    },
    statusHistory: history(['PENDING', 'CONFIRMED', ago(38)], ['CONFIRMED', 'PREPARING', ago(30)]),
  },
  {
    id: 'o-126',
    number: 126,
    createdAt: ago(55),
    status: 'READY_FOR_DELIVERY',
    total: 9800,
    itemCount: 2,
    branch: 'Centro',
    deliveryAddress: 'Av. Vergara 1500, Hurlingham',
    items: [baseItem('i-11', 'Ensalada Fresh', 1, 4800), baseItem('i-12', 'Milkshake', 1, 5000)],
    store: {
      label: 'Sucursal Centro',
      address: 'Av. Vergara 1200, Hurlingham',
      lat: -34.589,
      lon: -58.636,
    },
    client: { label: 'Casa', address: 'Av. Vergara 1500, Hurlingham', lat: -34.59, lon: -58.65 },
    customer: {
      name: 'Camila Sosa',
      phone: '+54 11 8901 2345',
      email: 'camila.sosa@email.com',
    },
    statusHistory: history(
      ['PENDING', 'CONFIRMED', ago(52)],
      ['CONFIRMED', 'PREPARING', ago(45)],
      ['PREPARING', 'READY_FOR_DELIVERY', ago(12)],
    ),
  },
  {
    id: 'o-125',
    number: 125,
    createdAt: ago(60 * 24 * 2),
    status: 'CANCELLED',
    total: 7200,
    itemCount: 2,
    branch: 'Centro',
    cancelReason: 'El cliente canceló el pedido.',
    deliveryAddress: 'Av. Roca 600, Hurlingham',
    items: [baseItem('i-13', 'Papas Fritas', 2, 3600)],
    store: {
      label: 'Sucursal Centro',
      address: 'Av. Vergara 1200, Hurlingham',
      lat: -34.589,
      lon: -58.636,
    },
    client: { label: 'Casa', address: 'Av. Roca 600, Hurlingham', lat: -34.591, lon: -58.644 },
    customer: {
      name: 'Lautaro Díaz',
      phone: '+54 11 9012 3456',
      email: 'lautaro.diaz@email.com',
    },
    statusHistory: history(['PENDING', 'CANCELLED', ago(60 * 24 * 2 - 10)]),
  },
]

export const getOrderById = (id: string): Order | null =>
  MOCK_ORDERS.find((order) => order.id === id) ?? null

export const getBranchOrders = (branch: string): Order[] =>
  MOCK_ORDERS.filter((order) => order.branch === branch)

export const withTransitions = (order: Order | null): Order | null =>
  order
    ? {
        ...order,
        availableTransitions: order.availableTransitions ?? getNextStatuses(order.status),
      }
    : null

const INCOMING_CUSTOMERS = [
  { name: 'Agustín Ríos', phone: '+54 11 1234 5678', email: 'agustin.rios@email.com' },
  { name: 'Martina Vega', phone: '+54 11 8765 4321', email: 'martina.vega@email.com' },
  { name: 'Bruno Castro', phone: '+54 11 2468 1357', email: 'bruno.castro@email.com' },
]

const INCOMING_ITEMS = [
  [baseItem('in-a', 'Hamburguesa Doble', 1, 5400), baseItem('in-b', 'Gaseosa 1.5L', 1, 3200)],
  [baseItem('in-c', 'Pizza Muzzarella', 1, 7800)],
  [baseItem('in-d', 'Hamburguesa Clásica', 2, 6500), baseItem('in-e', 'Papas Fritas', 1, 4800)],
]

let incomingCounter = 0

export const createIncomingOrder = (): Order => {
  const number = 131 + incomingCounter
  incomingCounter += 1
  const customer = INCOMING_CUSTOMERS[number % INCOMING_CUSTOMERS.length]!
  const items = INCOMING_ITEMS[number % INCOMING_ITEMS.length]!

  const order: Order = {
    id: `o-${number}`,
    number,
    createdAt: new Date().toISOString(),
    status: 'PENDING',
    total: items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0),
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    branch: 'Centro',
    deliveryAddress: 'Av. Vergara 1234, Hurlingham',
    items,
    store: {
      label: 'Sucursal Centro',
      address: 'Av. Vergara 1200, Hurlingham',
      lat: -34.589,
      lon: -58.636,
    },
    client: { label: 'Casa', address: 'Av. Vergara 1234, Hurlingham', lat: -34.592, lon: -58.646 },
    customer,
    statusHistory: [],
  }

  MOCK_ORDERS.unshift(order)
  return order
}
