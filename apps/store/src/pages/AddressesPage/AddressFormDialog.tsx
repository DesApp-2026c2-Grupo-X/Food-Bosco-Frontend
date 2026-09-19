import type { UseFormReturn } from 'react-hook-form'
import type { z } from 'zod'
import { addressSchema } from '@repo/domain'
import { ResponsiveModal } from '@repo/components'
import { AddressForm } from '../../components/AddressPickerModal/AddressForm'

type AddressValues = z.infer<typeof addressSchema>

interface AddressFormDialogProps {
  open: boolean
  editing: boolean
  submitting: boolean
  error: string | null
  form: UseFormReturn<AddressValues>
  onClose: () => void
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>
}

export const AddressFormDialog = ({
  open,
  editing,
  submitting,
  error,
  form,
  onClose,
  onSubmit,
}: AddressFormDialogProps) => {
  return (
    <ResponsiveModal open={open} onClose={onClose}>
      <AddressForm
        form={form}
        submitting={submitting}
        error={error}
        onSubmit={onSubmit}
        heading={editing ? 'Editar dirección' : 'Agregar dirección'}
        submitLabel="Guardar"
      />
    </ResponsiveModal>
  )
}
