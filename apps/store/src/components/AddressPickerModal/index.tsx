import { ResponsiveModal } from '@repo/components'
import { AddressPickerContent } from './AddressPickerContent'
import { useAddressPicker } from './hooks/useAddressPicker'
import type { AddressPickerModalProps } from './types'

export const AddressPickerModal = ({ open, onClose, closable = true }: AddressPickerModalProps) => {
  const picker = useAddressPicker(open, onClose)

  return (
    <ResponsiveModal open={open} onClose={onClose} closable={closable}>
      <AddressPickerContent {...picker} />
    </ResponsiveModal>
  )
}
