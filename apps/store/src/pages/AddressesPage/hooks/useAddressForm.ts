import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import type { z } from 'zod'
import { useAddressStore } from '../../../stores/addressStore'
import { addressSchema } from '@repo/domain'
import type { Address, AddressInput } from '@repo/domain'

type AddressValues = z.infer<typeof addressSchema>

const EMPTY: AddressValues = { label: '', street: '', city: '', reference: '' }

export const useAddressForm = () => {
  const addAddress = useAddressStore((state) => state.addAddress)
  const updateAddress = useAddressStore((state) => state.updateAddress)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [open, setOpen] = useState(false)

  const form = useForm<AddressValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: EMPTY,
    mode: 'onTouched',
    reValidateMode: 'onChange',
  })

  const openCreate = () => {
    setEditingId(null)
    form.reset(EMPTY)
    setOpen(true)
  }

  const openEdit = (address: Address) => {
    setEditingId(address.id)
    form.reset({
      label: address.label,
      street: address.street,
      city: address.city,
      reference: address.reference ?? '',
    })
    setOpen(true)
  }

  const close = () => setOpen(false)

  const onSubmit = form.handleSubmit((values) => {
    const input: AddressInput = {
      label: values.label.trim() || 'Dirección',
      street: values.street.trim(),
      city: values.city.trim(),
      reference: values.reference.trim() || undefined,
    }
    if (editingId) updateAddress(editingId, input)
    else addAddress(input)
    close()
  })

  return { form, open, editing: editingId !== null, openCreate, openEdit, close, onSubmit }
}
