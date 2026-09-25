import type { ReactNode } from 'react'

export interface ProductListLine {
  product: {
    id: number | string
    name: string
    image?: string | null
    price: number
  }
  categoryName: string
  available: boolean
}

export interface ProductsListViewProps {
  rows: ProductListLine[]
  isLoading: boolean
  isToggling: boolean
  description: string
  onToggle: (productId: number | string, checked: boolean) => void
  filters?: ReactNode
  onCreate?: () => void
  createLabel?: string
  rowAction?: (row: ProductListLine) => ReactNode
}
