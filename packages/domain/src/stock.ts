import type { FilterOption } from './filters'
import type { Ingredient } from './ingredient'

export interface BranchStock {
  ingredientId: string
  ingredient?: Ingredient | null
  branchId: string
  quantity: number
}

export interface AdjustStockInput {
  branchId: string
  ingredientId: string
  delta: number
  reason: string
}

export type StockAlertLevel = 'out_of_stock' | 'low_stock' | 'ok'

export const STOCK_ALERT_LABELS: Record<Exclude<StockAlertLevel, 'ok'>, string> = {
  out_of_stock: 'Sin stock',
  low_stock: 'Stock bajo',
}

export const STOCK_ALERT_PALETTE: Record<Exclude<StockAlertLevel, 'ok'>, 'red' | 'orange'> = {
  out_of_stock: 'red',
  low_stock: 'orange',
}

export const STOCK_STATUS_FILTER_OPTIONS: FilterOption[] = [
  { value: 'alert', label: 'En alerta (bajo o agotado)' },
  { value: 'low_stock', label: 'Con stock bajo' },
  { value: 'out_of_stock', label: 'Agotados (0)' },
  { value: 'ok', label: 'Stock normal' },
]

export const getStockAlertLevel = (row: BranchStock): StockAlertLevel => {
  const ingredient = row.ingredient
  const minQuantity = ingredient?.minQuantity ?? 0
  if (!ingredient || !ingredient.active || minQuantity <= 0) return 'ok'
  if (row.quantity <= 0) return 'out_of_stock'
  if (row.quantity <= minQuantity) return 'low_stock'
  return 'ok'
}

export const matchesStockStatus = (row: BranchStock, filter: string): boolean => {
  if (!filter) return true
  const level = getStockAlertLevel(row)
  if (filter === 'alert') return level !== 'ok'
  return level === filter
}

export const filterLowStockAlerts = (rows: BranchStock[]): BranchStock[] =>
  rows
    .filter((row) => getStockAlertLevel(row) !== 'ok')
    .sort((a, b) => {
      const aOut = a.quantity <= 0 ? 0 : 1
      const bOut = b.quantity <= 0 ? 0 : 1
      if (aOut !== bOut) return aOut - bOut
      const aMin = a.ingredient?.minQuantity ?? 1
      const bMin = b.ingredient?.minQuantity ?? 1
      const aRatio = a.quantity / aMin
      const bRatio = b.quantity / bMin
      if (aRatio !== bRatio) return aRatio - bRatio
      return (a.ingredient?.name ?? '').localeCompare(b.ingredient?.name ?? '')
    })
