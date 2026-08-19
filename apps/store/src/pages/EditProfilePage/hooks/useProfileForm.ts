import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { useProfile } from '@repo/api'
import { profileSchema } from '@repo/domain'
import { routes } from '../../../routes'

type ProfileValues = z.infer<typeof profileSchema>

export const useProfileForm = () => {
  const { user, isLoading, updateProfile } = useProfile()
  const navigate = useNavigate()

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
    navigate(routes.profile)
  })

  const onCancel = () => form.reset()

  return { user, isLoading, form, isDirty, onSave, onCancel }
}
