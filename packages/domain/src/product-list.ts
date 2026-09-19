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

interface ProductListLineSource {
  product: {
    id: number | string
    name: string
    image?: string | null
    price: number
    available?: boolean
  }
  categoryName: string
  available?: boolean
}

export function toProductListLine(row: {
  product: ProductListLineSource['product'] & { available: boolean }
  categoryName: string
}): ProductListLine
export function toProductListLine(row: {
  product: ProductListLineSource['product']
  categoryName: string
  available: boolean
}): ProductListLine
export function toProductListLine(row: ProductListLineSource): ProductListLine {
  return {
    product: row.product,
    categoryName: row.categoryName,
    available: row.available ?? row.product.available ?? false,
  }
}
