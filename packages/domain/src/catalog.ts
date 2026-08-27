import type { RecipeItem } from './ingredient'

export interface Category {
  id: number
  name: string
  slug: string
  active: boolean
}

export type ProductOptionType = 'single' | 'multiple'

export interface ProductOption {
  id: number
  name: string
  priceDelta: number
  active: boolean
}

export interface ProductConfigGroup {
  id: number
  name: string
  type: ProductOptionType
  required: boolean
  min: number
  max: number
  options: ProductOption[]
}

export interface Product {
  id: number
  name: string
  description: string
  price: number
  image: string
  categoryId: number
  available: boolean
  configGroups: ProductConfigGroup[]
  recipe?: RecipeItem[]
}

export interface CategoryInput {
  name: string
  active: boolean
}

export interface ProductInput {
  categoryId: number
  name: string
  description: string
  price: number
  image: string
  available: boolean
}

export interface ConfigGroupInput {
  name: string
  type: ProductOptionType
  required: boolean
  min: number
  max: number
}

export interface ConfigOptionInput {
  name: string
  priceDelta: number
  active: boolean
}
