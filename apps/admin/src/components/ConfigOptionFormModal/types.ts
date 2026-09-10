import type { ConfigOptionInput, ProductOption } from '@repo/domain'

export interface ConfigOptionFormModalProps {
  option: ProductOption | null
  isSubmitting: boolean
  onClose: () => void
  onSubmit: (input: ConfigOptionInput) => Promise<void>
}
