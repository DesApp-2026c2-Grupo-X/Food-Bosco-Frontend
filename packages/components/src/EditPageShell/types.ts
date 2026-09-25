import type { ReactNode } from 'react'

export interface EditPageShellNotFound {
  title: string
  description: string
}

export interface EditPageShellBlocked {
  when: boolean
  title: string
  description: string
}

export interface EditPageShellProps {
  isNew: boolean
  isLoading?: boolean
  hasEntity: boolean
  title: ReactNode
  loadingTitle: string
  notFound: EditPageShellNotFound
  blocked?: EditPageShellBlocked
  children: ReactNode
}
