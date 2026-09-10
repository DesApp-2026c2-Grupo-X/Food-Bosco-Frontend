import type { Branch, Order, OrderItem, OrderStatus, OrderStatusHistory, User } from '@repo/domain'
import { getNextStatuses } from '@repo/domain'

const ago = (minutes: number) => new Date(Date.now() - minutes * 60000).toISOString()

const history = (...entries: [OrderStatus, OrderStatus, string][]): OrderStatusHistory[] =>
  entries.map(([previousStatus, newStatus, changedAt]) => ({
    previousStatus,
    newStatus,
    changedAt,
  }))

const item = (productId: string, name: string, quantity: number, unitPrice: number): OrderItem => ({
  productId,
  name,
  unitPrice,
  quantity,
  observations: null,
  subtotal: unitPrice * quantity,
  options: [],
})

const customer = (name: string, phone: string, email: string): User => {
  const [firstName = '', ...rest] = name.split(' ')
  return {
    id: `client-${name.toLowerCase().replace(/\s+/g, '-')}`,
    email,
    role: 'customer',
    firstName,
    lastName: rest.join(' ') || '',
    phone,
    active: true,
    createdAt: ago(60 * 24 * 30),
  }
}

const CENTRO: Branch = {
  id: 'b1',
  name: 'Centro',
  addressText: 'Av. Vergara 1200, Hurlingham',
  latitude: -34.589,
  longitude: -58.636,
  phone: '11 5555 1111',
  active: true,
  hours: [],
}

const NORTE: Branch = {
  id: 'b2',
  name: 'Norte',
  addressText: 'Calle 25 de Mayo 450, Villa Tesei',
  latitude: -34.586,
  longitude: -58.63,
  phone: '11 5555 2222',
  active: true,
  hours: [],
}

const addr = (text: string, lat: number, lon: number) => ({ text, latitude: lat, longitude: lon })

const buildOrder = (
  id: string,
  number: string,
  branch: Branch,
  status: OrderStatus,
  createdAt: string,
  items: OrderItem[],
  client: User,
  deliveryAddress: { text: string; latitude: number; longitude: number },
  statusHistory: OrderStatusHistory[],
  estimatedDeliveryAt: string | null = null,
): Order => ({
  id,
  number,
  clientId: client.id,
  branchId: branch.id,
  branch,
  client,
  deliveryAddress,
  status,
  total: items.reduce((sum, entry) => sum + entry.subtotal, 0),
  estimatedDeliveryAt,
  createdAt,
  items,
  statusHistory,
  availableTransitions: getNextStatuses(status),
})

export const MOCK_ORDERS: Order[] = [
  buildOrder(
    'o-128',
    '128',
    CENTRO,
    'ON_THE_WAY',
    ago(50),
    [item('101', 'Hamburguesa Doble', 2, 5400), item('301', 'Papas Grandes', 1, 5600)],
    customer('Juan Pérez', '+54 11 2345 6789', 'juan.perez@email.com'),
    addr('Av. Vergara 1234, Hurlingham', -34.592, -58.646),
    history(
      ['PENDING', 'CONFIRMED', ago(45)],
      ['CONFIRMED', 'PREPARING', ago(35)],
      ['PREPARING', 'READY_FOR_DELIVERY', ago(20)],
      ['READY_FOR_DELIVERY', 'ON_THE_WAY', ago(10)],
    ),
    new Date(Date.now() + 35 * 60000).toISOString(),
  ),
  buildOrder(
    'o-98',
    '98',
    CENTRO,
    'DELIVERED',
    ago(60 * 24 * 3),
    [item('201', 'Pizza Muzzarella', 1, 8900), item('401', 'Gaseosa 1.5L', 1, 3200)],
    customer('Sofía Ledesma', '+54 11 3456 7890', 'sofia.ledesma@email.com'),
    addr('Av. Vergara 1234, Hurlingham', -34.592, -58.646),
    history(
      ['PENDING', 'CONFIRMED', ago(60 * 24 * 3)],
      ['CONFIRMED', 'PREPARING', ago(60 * 24 * 3 - 10)],
      ['PREPARING', 'READY_FOR_DELIVERY', ago(60 * 24 * 3 - 18)],
      ['READY_FOR_DELIVERY', 'ON_THE_WAY', ago(60 * 24 * 3 - 22)],
      ['ON_THE_WAY', 'DELIVERED', ago(60 * 24 * 3 - 20)],
    ),
  ),
  buildOrder(
    'o-75',
    '75',
    NORTE,
    'CANCELLED',
    ago(60 * 24 * 7),
    [item('102', 'Lomito Completo', 1, 8900)],
    customer('Rocío Fernández', '+54 11 4567 8901', 'rocio.fernandez@email.com'),
    addr('Dr. Vergara 2200, Villa Tesei', -34.583, -58.624),
    history(['PENDING', 'CANCELLED', ago(60 * 24 * 7 - 15)]),
  ),
  buildOrder(
    'o-130',
    '130',
    CENTRO,
    'PENDING',
    ago(6),
    [item('101', 'Hamburguesa Clásica', 1, 6500)],
    customer('Mateo Álvarez', '+54 11 5678 9012', 'mateo.alvarez@email.com'),
    addr('Av. San Martín 800, Hurlingham', -34.595, -58.648),
    [],
  ),
  buildOrder(
    'o-129',
    '129',
    CENTRO,
    'CONFIRMED',
    ago(25),
    [item('102', 'Doble Cheddar', 1, 8900), item('301', 'Papas Fritas', 1, 4800)],
    customer('Valentina Ruiz', '+54 11 6789 0123', 'valentina.ruiz@email.com'),
    addr('Calle Alem 450, Hurlingham', -34.588, -58.642),
    history(['PENDING', 'CONFIRMED', ago(20)]),
  ),
  buildOrder(
    'o-127',
    '127',
    CENTRO,
    'PREPARING',
    ago(40),
    [item('201', 'Pizza Mozzarella', 1, 7800), item('401', 'Gaseosa', 2, 3900)],
    customer('Tomás Giménez', '+54 11 7890 1234', 'tomas.gimenez@email.com'),
    addr('Av. Jauretche 1100, Hurlingham', -34.587, -58.634),
    history(['PENDING', 'CONFIRMED', ago(38)], ['CONFIRMED', 'PREPARING', ago(30)]),
  ),
  buildOrder(
    'o-126',
    '126',
    CENTRO,
    'READY_FOR_DELIVERY',
    ago(55),
    [item('303', 'Ensalada Fresh', 1, 4800), item('502', 'Milkshake', 1, 5000)],
    customer('Camila Sosa', '+54 11 8901 2345', 'camila.sosa@email.com'),
    addr('Av. Vergara 1500, Hurlingham', -34.59, -58.65),
    history(
      ['PENDING', 'CONFIRMED', ago(52)],
      ['CONFIRMED', 'PREPARING', ago(45)],
      ['PREPARING', 'READY_FOR_DELIVERY', ago(12)],
    ),
  ),
  buildOrder(
    'o-125',
    '125',
    CENTRO,
    'CANCELLED',
    ago(60 * 24 * 2),
    [item('301', 'Papas Fritas', 2, 3600)],
    customer('Lautaro Díaz', '+54 11 9012 3456', 'lautaro.diaz@email.com'),
    addr('Av. Roca 600, Hurlingham', -34.591, -58.644),
    history(['PENDING', 'CANCELLED', ago(60 * 24 * 2 - 10)]),
  ),
]

export const getOrderById = (id: string): Order | null =>
  MOCK_ORDERS.find((order) => order.id === id) ?? null

export const getBranchOrders = (branch: string): Order[] =>
  MOCK_ORDERS.filter((order) => order.branch?.name === branch)

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
  [item('102', 'Hamburguesa Doble', 1, 5400), item('401', 'Gaseosa 1.5L', 1, 3200)],
  [item('201', 'Pizza Muzzarella', 1, 7800)],
  [item('101', 'Hamburguesa Clásica', 2, 6500), item('301', 'Papas Fritas', 1, 4800)],
]

let incomingCounter = 0

export const createIncomingOrder = (): Order => {
  const number = 131 + incomingCounter
  incomingCounter += 1
  const data = INCOMING_CUSTOMERS[number % INCOMING_CUSTOMERS.length]!
  const items = INCOMING_ITEMS[number % INCOMING_ITEMS.length]!

  const order: Order = buildOrder(
    `o-${number}`,
    String(number),
    CENTRO,
    'PENDING',
    new Date().toISOString(),
    items,
    customer(data.name, data.phone, data.email),
    addr('Av. Vergara 1234, Hurlingham', -34.592, -58.646),
    [],
  )

  MOCK_ORDERS.unshift(order)
  return order
}
