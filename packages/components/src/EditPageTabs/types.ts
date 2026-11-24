import type { ReactNode } from 'react'

export interface EditPageTab {
  value: string
  label: string
  content: ReactNode
  hasError?: boolean
}

export interface EditPageTabsProps {
  defaultValue: string
  value?: string
  onChange?: (value: string) => void
  tabs: EditPageTab[]
}
