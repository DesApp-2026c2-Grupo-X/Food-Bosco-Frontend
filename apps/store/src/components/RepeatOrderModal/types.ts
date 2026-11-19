import type { HomeFeedReorder } from '@repo/domain'

export type RepeatOrderSource = Pick<HomeFeedReorder, 'id' | 'number' | 'items'>

export interface RepeatOrderModalProps {
  order: RepeatOrderSource
  onClose: () => void
}
