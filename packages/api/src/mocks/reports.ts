import type { OutOfStockRow, ProductReportRow } from '@repo/domain'
import { MOCK_CATEGORIES, MOCK_PRODUCTS } from './catalog'

const categoryFor = (categoryId: number) =>
  MOCK_CATEGORIES.find((category) => category.id === categoryId)

const productById = (id: number) => MOCK_PRODUCTS.find((product) => product.id === id)

const bestSeller = (id: number, position: number, quantity: number): ProductReportRow => ({
  position,
  product: productById(id)!,
  category: categoryFor(productById(id)!.categoryId),
  quantity,
})

const highestRevenue = (id: number, position: number, revenue: number): ProductReportRow => ({
  position,
  product: productById(id)!,
  category: categoryFor(productById(id)!.categoryId),
  revenue,
})

const outOfStock = (id: number, quantity: number): OutOfStockRow => ({
  product: productById(id)!,
  category: categoryFor(productById(id)!.categoryId),
  quantity,
})

export const MOCK_BEST_SELLERS: ProductReportRow[] = [
  bestSeller(101, 1, 250),
  bestSeller(301, 2, 180),
  bestSeller(401, 3, 160),
  bestSeller(201, 4, 120),
  bestSeller(102, 5, 95),
]

export const MOCK_LEAST_SOLD: ProductReportRow[] = [
  bestSeller(503, 1, 0),
  bestSeller(303, 2, 0),
  bestSeller(502, 3, 3),
  bestSeller(402, 4, 5),
  bestSeller(302, 5, 8),
]

export const MOCK_OUT_OF_STOCK: OutOfStockRow[] = [
  outOfStock(202, 0),
  outOfStock(503, 0),
  outOfStock(402, 0),
]

export const MOCK_HIGHEST_REVENUE: ProductReportRow[] = [
  highestRevenue(101, 1, 1625000),
  highestRevenue(201, 2, 936000),
  highestRevenue(102, 3, 845500),
  highestRevenue(301, 4, 576000),
  highestRevenue(401, 5, 304000),
]
