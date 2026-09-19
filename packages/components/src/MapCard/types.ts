import type { ReactNode } from 'react'

export interface MapCardProps {
  src: string
  alt: string
  legend?: ReactNode
  note?: ReactNode
  height?: string
}
