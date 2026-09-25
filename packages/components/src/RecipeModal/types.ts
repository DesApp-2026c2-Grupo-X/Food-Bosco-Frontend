import type { ReactNode } from 'react'

export interface RecipeModalItem {
  name: string
  quantity: number
  unit: string
}

export interface RecipeModalProps {
  title?: string
  description?: ReactNode
  items: RecipeModalItem[]
  open: boolean
  onClose: () => void
}
