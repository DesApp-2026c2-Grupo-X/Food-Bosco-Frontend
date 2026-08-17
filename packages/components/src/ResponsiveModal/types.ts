import type { ReactNode } from "react"

export interface ResponsiveModalProps {
  open: boolean
  onClose: () => void
  children: ReactNode
}
