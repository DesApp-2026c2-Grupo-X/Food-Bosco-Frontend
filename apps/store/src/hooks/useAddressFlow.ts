import { useCallback, useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { z } from 'zod'
import { geocodeAddress, useAddresses } from '@repo/api'
import { addressSchema, toAddressInput } from '@repo/domain'
import type { Address, AddressInput } from '@repo/domain'
import { useAddressStore } from '../stores/addressStore'

type AddressValues = z.infer<typeof addressSchema>

const EMPTY: AddressValues = { label: '', text: '', city: '', postalCode: '' }

export type AddressFlowStep = 'list' | 'form' | 'confirm'
export type AddressFlowMode = 'picker' | 'manage'

interface UseAddressFlowOptions {
  open: boolean
  mode: AddressFlowMode
  editing: Address | null
  onSaved?: (address: Address | null) => void
  onSelect?: (id: string) => void
}

export const useAddressFlow = ({
  open,
  mode,
  editing,
  onSaved,
  onSelect,
}: UseAddressFlowOptions) => {
  const { addresses, create, update } = useAddresses()
  const selectAddress = useAddressStore((state) => state.selectAddress)

  const [step, setStep] = useState<AddressFlowStep>('form')
  const [pending, setPending] = useState<AddressInput | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<AddressValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: EMPTY,
    mode: 'onTouched',
    reValidateMode: 'onChange',
  })

  const addressesCountRef = useRef(addresses.length)
  addressesCountRef.current = addresses.length
  const editingRef = useRef<Address | null>(editing)
  editingRef.current = editing
  const onSavedRef = useRef(onSaved)
  onSavedRef.current = onSaved
  const onSelectRef = useRef(onSelect)
  onSelectRef.current = onSelect

  useEffect(() => {
    setError(null)
    setPending(null)
    setSubmitting(false)

    if (!open) {
      setStep('form')
      setEditingId(null)
      form.reset(EMPTY)
      return
    }

    const currentEditing = editingRef.current
    if (mode === 'picker' && addressesCountRef.current > 0) {
      setEditingId(null)
      setStep('list')
    } else if (currentEditing) {
      setEditingId(currentEditing.id)
      setStep('form')
      form.reset({
        label: currentEditing.label,
        text: currentEditing.text,
        city: currentEditing.city ?? '',
        postalCode: currentEditing.postalCode ?? '',
      })
    } else {
      setEditingId(null)
      setStep('form')
      form.reset(EMPTY)
    }
  }, [open, mode, form])

  const openForm = useCallback(() => {
    setError(null)
    setPending(null)
    setEditingId(null)
    form.reset(EMPTY)
    setStep('form')
  }, [form])

  const select = (id: string) => {
    selectAddress(id)
    onSelectRef.current?.(id)
  }

  const submitForm = form.handleSubmit(async (values) => {
    const coords = await geocodeAddress(
      [values.text.trim(), values.city?.trim()].filter(Boolean).join(', '),
    )
    if (!coords) {
      setError('No pudimos ubicar esa dirección. Revisá los datos.')
      return
    }

    setError(null)
    setPending(
      toAddressInput({
        ...values,
        latitude: coords.lat,
        longitude: coords.lon,
      }),
    )
    setStep('confirm')
  })

  const confirm = async () => {
    if (!pending) return

    setSubmitting(true)
    setError(null)
    try {
      if (editingId) {
        await update(editingId, pending)
        onSavedRef.current?.(null)
      } else {
        const created = await create(pending)
        if (created) selectAddress(created.id)
        onSavedRef.current?.(created ?? null)
      }
    } catch {
      setError('No pudimos guardar la dirección.')
    } finally {
      setSubmitting(false)
    }
  }

  const backToForm = useCallback(() => {
    setError(null)
    setStep('form')
  }, [])

  const backToList = useCallback(() => {
    setError(null)
    setStep('list')
  }, [])

  return {
    addresses,
    step,
    form,
    pending,
    editing: editingId !== null,
    submitting,
    error,
    select,
    openForm,
    submitForm,
    confirm,
    backToForm,
    backToList,
  }
}
