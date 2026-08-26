import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import type { z } from 'zod'
import { useAddresses } from '@repo/api'
import { useAddressStore } from '../../../stores/addressStore'
import { addressSchema } from '@repo/domain'
import type { Address, AddressInput } from '@repo/domain'
import { geocodeAddress } from '../../../utils/geoapify'
import { toTitleCase } from '../../../utils/format'

type AddressValues = z.infer<typeof addressSchema>

const EMPTY: AddressValues = { label: '', text: '', city: '', postalCode: '' }

export const useAddressForm = () => {
  const { create, update } = useAddresses()
  const selectAddress = useAddressStore((state) => state.selectAddress)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<AddressValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: EMPTY,
    mode: 'onTouched',
    reValidateMode: 'onChange',
  })

  const openCreate = () => {
    setEditingId(null)
    form.reset(EMPTY)
    setError(null)
    setOpen(true)
  }

  const openEdit = (address: Address) => {
    setEditingId(address.id)
    form.reset({
      label: address.label,
      text: address.text,
      city: address.city ?? '',
      postalCode: address.postalCode ?? '',
    })
    setError(null)
    setOpen(true)
  }

  const close = () => {
    setOpen(false)
    setError(null)
  }

  const onSubmit = form.handleSubmit(async (values) => {
    const coords = await geocodeAddress(`${values.text.trim()}, ${values.city.trim()}`)
    if (!coords) {
      setError('No pudimos ubicar esa dirección. Revisá los datos.')
      return
    }

    const input: AddressInput = {
      label: toTitleCase(values.label) || 'Dirección',
      text: toTitleCase(values.text),
      city: toTitleCase(values.city),
      postalCode: values.postalCode.trim(),
      latitude: coords.lat,
      longitude: coords.lon,
    }

    setSubmitting(true)
    setError(null)
    try {
      if (editingId) await update(editingId, input)
      else {
        const created = await create(input)
        if (created) selectAddress(created.id)
      }
      close()
    } catch {
      setError('No pudimos guardar la dirección.')
    } finally {
      setSubmitting(false)
    }
  })

  return {
    form,
    open,
    editing: editingId !== null,
    submitting,
    error,
    openCreate,
    openEdit,
    close,
    onSubmit,
  }
}
