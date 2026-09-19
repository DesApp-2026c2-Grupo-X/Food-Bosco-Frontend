import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { z } from 'zod'
import { useAuthStore, useRiderProfile } from '@repo/api'
import { riderProfileSchema } from '@repo/domain'

type RiderProfileValues = z.infer<typeof riderProfileSchema>

export const useRiderProfileForm = () => {
  const user = useAuthStore((state) => state.user)
  const { profile, isLoading, updateProfile } = useRiderProfile()
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const form = useForm<RiderProfileValues>({
    resolver: zodResolver(riderProfileSchema),
    defaultValues: {
      phone: profile?.phone ?? '',
    },
    mode: 'onTouched',
    reValidateMode: 'onChange',
  })

  useEffect(() => {
    if (profile) {
      form.reset({ phone: profile.phone ?? '' })
    }
  }, [profile, form])

  const isDirty = form.formState.isDirty

  const onSave = form.handleSubmit(async (values) => {
    setSubmitting(true)
    setError(null)
    try {
      await updateProfile(values)
      form.reset(values)
    } catch {
      setError('No pudimos guardar tus datos. Intentá de nuevo.')
    } finally {
      setSubmitting(false)
    }
  })

  const onCancel = () => {
    form.reset({ phone: profile?.phone ?? '' })
  }

  return { user, isLoading, form, isDirty, submitting, error, onSave, onCancel }
}
