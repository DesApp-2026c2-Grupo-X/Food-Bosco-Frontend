import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm, type DefaultValues, type FieldValues } from 'react-hook-form'
import type { z } from 'zod'

export class AuthSubmitError extends Error {}

export interface UseAuthFormOptions<TValues extends FieldValues> {
  schema: z.ZodType<TValues, TValues>
  defaultValues: DefaultValues<TValues>
  submit: (values: TValues) => Promise<void>
  errorMessage: string
}

export const useAuthForm = <TValues extends FieldValues>({
  schema,
  defaultValues,
  submit,
  errorMessage,
}: UseAuthFormOptions<TValues>) => {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<TValues>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: 'onTouched',
    reValidateMode: 'onChange',
  })

  const onSubmit = form.handleSubmit(async (values) => {
    setSubmitting(true)
    setError(null)
    try {
      await submit(values)
    } catch (caught) {
      setError(caught instanceof AuthSubmitError ? caught.message : errorMessage)
    } finally {
      setSubmitting(false)
    }
  })

  return { form, submitting, error, onSubmit }
}
