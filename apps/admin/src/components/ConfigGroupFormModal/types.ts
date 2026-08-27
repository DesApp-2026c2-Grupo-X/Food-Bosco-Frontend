import type { ConfigGroupInput, ProductConfigGroup } from '@repo/domain'

export interface ConfigGroupFormModalProps {
  group: ProductConfigGroup | null
  isSubmitting: boolean
  onClose: () => void
  onSubmit: (input: ConfigGroupInput) => Promise<void>
}
