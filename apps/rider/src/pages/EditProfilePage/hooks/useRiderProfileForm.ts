import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { z } from 'zod'
import { MOCK_RIDER_USER, useAuthStore, useRiderProfile } from '@repo/api'
import { riderProfileSchema } from '@repo/domain'

type RiderProfileValues = z.infer<typeof riderProfileSchema>

export const useRiderProfileForm = () => {
  const user = useAuthStore((state) => state.user) ?? MOCK_RIDER_USER
  const { profile, isLoading, updateProfile } = useRiderProfile()

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
      form.reset({ phone: profile.phone })
    }
  }, [profile, form])

  const isDirty = form.formState.isDirty

  const onSave = form.handleSubmit(async (values) => {
    await updateProfile(values)
    form.reset(values)
  })

  const onCancel = () => {
    form.reset({ phone: profile?.phone ?? '' })
  }

  return { user, isLoading, form, isDirty, onSave, onCancel }
}
