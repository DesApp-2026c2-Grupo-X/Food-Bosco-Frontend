import { AddressSheet } from '../AddressForm/AddressSheet'
import type { AddressPickerModalProps } from './types'

export const AddressPickerModal = ({ open, onClose, closable = true }: AddressPickerModalProps) => (
  <AddressSheet
    open={open}
    onClose={onClose}
    mode="picker"
    closable={closable}
    onSelect={onClose}
    onSaved={onClose}
  />
)
