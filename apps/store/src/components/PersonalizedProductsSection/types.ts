import type { ReactNode } from 'react'
import type { PersonalizedProduct } from '@repo/domain'

export interface PersonalizedProductsSectionProps {
  label: string
  title: string
  products: PersonalizedProduct[]
  action?: ReactNode
}
