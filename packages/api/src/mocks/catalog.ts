import type { Category, Product, ProductConfigGroup } from '@repo/domain'

const img = (id: string, width = 800) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${width}&q=80`

const sizeGroup = (id: number, name: string, options: [string, number][]): ProductConfigGroup => ({
  id,
  name,
  type: 'single',
  required: true,
  min: 1,
  max: 1,
  options: options.map(([label, delta], i) => ({
    id: id * 100 + i,
    name: label,
    priceDelta: delta,
    active: true,
  })),
})

const extrasGroup = (id: number, options: [string, number][]): ProductConfigGroup => ({
  id,
  name: 'Extras',
  type: 'multiple',
  required: false,
  min: 0,
  max: options.length,
  options: options.map(([label, delta], i) => ({
    id: id * 100 + i,
    name: label,
    priceDelta: delta,
    active: true,
  })),
})

export const MOCK_CATEGORIES: Category[] = [
  { id: 1, name: 'Hamburguesas', slug: 'hamburguesas', active: true },
  { id: 2, name: 'Pizzas', slug: 'pizzas', active: true },
  { id: 3, name: 'Acompañamientos', slug: 'acompanamientos', active: true },
  { id: 4, name: 'Bebidas', slug: 'bebidas', active: true },
  { id: 5, name: 'Postres', slug: 'postres', active: true },
]

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 101,
    name: 'Hamburguesa Clásica',
    description: 'Carne 120g, cheddar, lechuga, tomate y salsa de la casa.',
    price: 6500,
    image: img('1568901346375-23c9450c58cd'),
    categoryId: 1,
    available: true,
    configGroups: [
      sizeGroup(1, 'Tamaño', [
        ['Simple', 0],
        ['Doble', 1500],
        ['Triple', 2500],
      ]),
      extrasGroup(2, [
        ['Queso extra', 800],
        ['Bacon', 900],
        ['Huevo', 500],
      ]),
    ],
  },
  {
    id: 102,
    name: 'Doble Cheddar',
    description: 'Doble carne, doble cheddar y cebolla caramelizada.',
    price: 8900,
    image: img('1571091718767-18b5b1457add'),
    categoryId: 1,
    available: true,
    configGroups: [
      sizeGroup(3, 'Tamaño', [
        ['Simple', 0],
        ['Doble', 1200],
      ]),
      extrasGroup(4, [
        ['Bacon', 900],
        ['Jalapeños', 600],
      ]),
    ],
  },
  {
    id: 201,
    name: 'Pizza Mozzarella',
    description: 'Muzzarella, tomate, aceite de oliva y orégano.',
    price: 7800,
    image: img('1513104890138-7c749659a591'),
    categoryId: 2,
    available: true,
    configGroups: [
      sizeGroup(5, 'Tamaño', [
        ['Grande', 0],
        ['Familiar', 2500],
      ]),
      extrasGroup(6, [
        ['Jamón', 1200],
        ['Aceitunas', 700],
      ]),
    ],
  },
  {
    id: 202,
    name: 'Pizza Napolitana',
    description: 'Muzzarella, tomate, ajo y albahaca fresca.',
    price: 8200,
    image: img('1565299624946-b28f40a0ae38'),
    categoryId: 2,
    available: true,
    configGroups: [
      sizeGroup(7, 'Tamaño', [
        ['Grande', 0],
        ['Familiar', 2500],
      ]),
      extrasGroup(8, [['Queso extra', 1000]]),
    ],
  },
  {
    id: 301,
    name: 'Papas Fritas',
    description: 'Papas crocantes con sal de la casa.',
    price: 3200,
    image: img('1573080496219-bb080dd4f877'),
    categoryId: 3,
    available: true,
    configGroups: [
      sizeGroup(9, 'Tamaño', [
        ['Chico', 0],
        ['Grande', 900],
      ]),
      extrasGroup(10, [
        ['Cheddar', 900],
        ['Bacon', 800],
      ]),
    ],
  },
  {
    id: 302,
    name: 'Pollo Crocante',
    description: 'Bocaditos de pollo rebozados con salsa de la casa.',
    price: 5600,
    image: img('1562967914-608f82629710'),
    categoryId: 3,
    available: true,
    configGroups: [
      sizeGroup(11, 'Porción', [
        ['6 unidades', 0],
        ['10 unidades', 1400],
      ]),
    ],
  },
  {
    id: 303,
    name: 'Ensalada Fresh',
    description: 'Mix de hojas, tomate, zanahoria y aderezo cítrico.',
    price: 4800,
    image: img('1512621776951-a57141f2eefd'),
    categoryId: 3,
    available: true,
    configGroups: [
      extrasGroup(12, [
        ['Pollo', 1600],
        ['Queso', 700],
      ]),
    ],
  },
  {
    id: 401,
    name: 'Gaseosa',
    description: 'Línea regular, bien fría.',
    price: 1900,
    image: img('1554866585-cd94860890b7'),
    categoryId: 4,
    available: true,
    configGroups: [
      sizeGroup(13, 'Tamaño', [
        ['500ml', 0],
        ['1L', 600],
      ]),
    ],
  },
  {
    id: 402,
    name: 'Café',
    description: 'Café de especialidad, con opción a leche.',
    price: 2100,
    image: img('1509042239860-f550ce710b93'),
    categoryId: 4,
    available: true,
    configGroups: [
      extrasGroup(14, [
        ['Leche', 200],
        ['Azúcar', 0],
      ]),
    ],
  },
  {
    id: 501,
    name: 'Helado',
    description: 'Dos bochas a elección con salsa de chocolate.',
    price: 3400,
    image: img('1560008581-09826d1de69e'),
    categoryId: 5,
    available: true,
    configGroups: [
      sizeGroup(15, 'Tamaño', [
        ['1 bocha', 0],
        ['2 bochas', 700],
        ['3 bochas', 1300],
      ]),
    ],
  },
  {
    id: 502,
    name: 'Milkshake',
    description: 'Cremoso, con crema batida y cereza.',
    price: 3900,
    image: img('1572490122747-3968b75cc699'),
    categoryId: 5,
    available: true,
    configGroups: [
      sizeGroup(16, 'Tamaño', [
        ['Chico', 0],
        ['Grande', 800],
      ]),
    ],
  },
  {
    id: 503,
    name: 'Donas',
    description: 'Media docena surtida.',
    price: 3600,
    image: img('1551024601-bec78aea704b'),
    categoryId: 5,
    available: true,
    configGroups: [
      sizeGroup(17, 'Cantidad', [
        ['Media docena', 0],
        ['Docena', 3200],
      ]),
    ],
  },
]

export const getProductById = (id: number) => MOCK_PRODUCTS.find((p) => p.id === id)

export const getProductsByCategory = (categoryId: number) =>
  MOCK_PRODUCTS.filter((p) => p.categoryId === categoryId)

export const getCategoryName = (categoryId: number) =>
  MOCK_CATEGORIES.find((c) => c.id === categoryId)?.name
