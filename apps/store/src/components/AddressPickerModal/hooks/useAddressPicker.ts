import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import type { z } from 'zod'
import { useAddresses } from '@repo/api'
import { useAddressStore } from '../../../stores/addressStore'
import { addressSchema } from '@repo/domain'
import type { Address, AddressInput } from '@repo/domain'
import { geocodeAddress } from '../../../utils/geoapify'
import { toTitleCase } from '../../../utils/format'

type AddressValues = z.infer<typeof addressSchema>

const EMPTY: AddressValues = { label: '', text: '', city: '', postalCode: '' }

type PickerStep = 'list' | 'form' | 'confirm'

export interface UseAddressPickerReturn {
  addresses: Address[]
  step: PickerStep
  form: ReturnType<typeof useForm<AddressValues>>
  pending: AddressInput | null
  submitting: boolean
  error: string | null
  handleSelect: (id: string) => void
  handleSubmitForm: (e?: React.BaseSyntheticEvent) => Promise<void>
  handleConfirm: () => Promise<void>
  openForm: () => void
  backToForm: () => void
  backToList: () => void
}

export const useAddressPicker = (open: boolean, onClose: () => void): UseAddressPickerReturn => {
  const { addresses, create } = useAddresses()
  const selectAddress = useAddressStore((state) => state.selectAddress)

  const [step, setStep] = useState<PickerStep>(addresses.length === 0 ? 'form' : 'list')
  const [pending, setPending] = useState<AddressInput | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<AddressValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: EMPTY,
    mode: 'onTouched',
    reValidateMode: 'onChange',
  })

  useEffect(() => {
    if (!open) {
      setStep(addresses.length === 0 ? 'form' : 'list')
      setPending(null)
      form.reset(EMPTY)
      setError(null)
    }
  }, [open, addresses.length, form])

  const handleSelect = (id: string) => {
    selectAddress(id)
    onClose()
  }

  const handleSubmitForm = form.handleSubmit(async (values) => {
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

    setError(null)
    setPending(input)
    setStep('confirm')
  })

  const handleConfirm = async () => {
    if (!pending) return

    setSubmitting(true)
    setError(null)
    try {
      const created = await create(pending)
      if (created) selectAddress(created.id)
      onClose()
    } catch {
      setError('No pudimos guardar la dirección.')
    } finally {
      setSubmitting(false)
    }
  }

  return {
    addresses,
    step,
    form,
    pending,
    submitting,
    error,
    handleSelect,
    handleSubmitForm,
    handleConfirm,
    openForm: () => {
      setError(null)
      setStep('form')
    },
    backToForm: () => {
      setError(null)
      setStep('form')
    },
    backToList: () => {
      setError(null)
      setStep('list')
    },
  }
}
