import type { ReactNode } from "react"

export interface SidePanelProps {
  open: boolean
  onClose: () => void
  title: string
  header?: ReactNode
  footer?: ReactNode
  children: ReactNode
  maxW?: string
}
