import type { RecipeItem } from './ingredient'

export interface Category {
  id: string
  name: string
  active: boolean
}

export type ProductOptionType = 'single' | 'multiple'

export interface ProductOption {
  id: string
  name: string
  extraPrice: number
  available: boolean
}

export interface ProductConfigGroup {
  id: string
  name: string
  type: ProductOptionType
  required: boolean
  min: number | null
  max: number | null
  options: ProductOption[]
}

export interface Product {
  id: string
  categoryId: string
  name: string
  description: string
  price: number
  image: string | null
  available: boolean
  configGroups: ProductConfigGroup[]
  recipe: RecipeItem[]
}

export interface CategoryInput {
  name: string
  active: boolean
}

export interface ProductInput {
  categoryId: string
  name: string
  description: string
  price: number
  image?: string | null
  available: boolean
}

export interface ConfigGroupInput {
  name: string
  type: ProductOptionType
  required: boolean
  min?: number | null
  max?: number | null
}

export interface ConfigOptionInput {
  name: string
  extraPrice: number
  available: boolean
}
