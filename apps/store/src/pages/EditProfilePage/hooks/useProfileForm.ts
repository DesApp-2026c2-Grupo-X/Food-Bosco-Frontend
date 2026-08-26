import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { z } from 'zod'
import { useProfile } from '@repo/api'
import { profileSchema } from '@repo/domain'

type ProfileValues = z.infer<typeof profileSchema>

interface UseProfileFormOptions {
  userId?: number
}

export const useProfileForm = ({ userId }: UseProfileFormOptions) => {
  const { user, isLoading, updateProfile } = useProfile(userId)

  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName ?? '',
      lastName: user?.lastName ?? '',
      phone: user?.phone ?? '',
    },
    mode: 'onTouched',
    reValidateMode: 'onChange',
  })

  const isDirty = form.formState.isDirty

  const onSave = form.handleSubmit(async (values) => {
    await updateProfile(values)
    form.reset(values)
  })

  const onCancel = () => form.reset()

  return { user, isLoading, form, isDirty, onSave, onCancel }
}
