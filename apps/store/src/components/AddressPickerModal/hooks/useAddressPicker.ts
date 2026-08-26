import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import type { z } from 'zod'
import { useAddressStore } from '../../../stores/addressStore'
import { addressSchema } from '@repo/domain'
import type { Address, AddressInput } from '@repo/domain'

type AddressValues = z.infer<typeof addressSchema>

const EMPTY: AddressValues = { label: '', street: '', city: '', reference: '' }

export interface UseAddressPickerReturn {
  addresses: Address[]
  showForm: boolean
  form: ReturnType<typeof useForm<AddressValues>>
  handleSelect: (id: string) => void
  handleAdd: (e?: React.BaseSyntheticEvent) => Promise<void>
  openForm: () => void
  closeForm: () => void
}

export const useAddressPicker = (open: boolean, onClose: () => void): UseAddressPickerReturn => {
  const addresses = useAddressStore((state) => state.addresses)
  const selectAddress = useAddressStore((state) => state.selectAddress)
  const addAddress = useAddressStore((state) => state.addAddress)

  const [showForm, setShowForm] = useState(addresses.length === 0)

  const form = useForm<AddressValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: EMPTY,
    mode: 'onTouched',
    reValidateMode: 'onChange',
  })

  useEffect(() => {
    if (!open) {
      setShowForm(addresses.length === 0)
      form.reset(EMPTY)
    }
  }, [open, addresses.length, form])

  const handleSelect = (id: string) => {
    selectAddress(id)
    onClose()
  }

  const handleAdd = form.handleSubmit((values) => {
    const input: AddressInput = {
      label: values.label.trim() || 'Dirección',
      street: values.street.trim(),
      city: values.city.trim(),
      reference: values.reference.trim() || undefined,
    }
    addAddress(input)
    onClose()
  })

  return {
    addresses,
    showForm,
    form,
    handleSelect,
    handleAdd,
    openForm: () => setShowForm(true),
    closeForm: () => setShowForm(false),
  }
}
