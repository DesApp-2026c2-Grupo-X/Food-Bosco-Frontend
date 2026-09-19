import type { ReactNode } from 'react'

export interface SummaryCardProps {
  title: ReactNode
  meta?: ReactNode
  trailing?: ReactNode
  children?: ReactNode
  href?: string
}
