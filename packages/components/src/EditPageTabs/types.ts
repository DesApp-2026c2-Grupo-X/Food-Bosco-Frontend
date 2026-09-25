import type { ReactNode } from 'react'

export interface EditPageTab {
  value: string
  label: string
  content: ReactNode
}

export interface EditPageTabsProps {
  defaultValue: string
  tabs: EditPageTab[]
}
