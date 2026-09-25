import { Heading } from '@chakra-ui/react'
import { FormProvider, type FieldValues } from 'react-hook-form'
import { PrimaryButton } from '../Button'
import { FormLayout } from '../FormLayout'
import { ResponsiveModal } from '../ResponsiveModal'
import type { FormModalProps } from './types'

export const FormModal = <TFieldValues extends FieldValues>({
  open,
  onClose,
  title,
  subtitle,
  form,
  onSubmit,
  submitLabel = 'Guardar',
  isSubmitting = false,
  headingMarginBottom = '4',
  children,
}: FormModalProps<TFieldValues>) => (
  <ResponsiveModal open={open} onClose={onClose}>
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Heading as="h2" fontSize="xl" fontWeight="bold" marginBottom={headingMarginBottom}>
          {title}
        </Heading>
        {subtitle}
        <FormLayout>
          {children}
          <PrimaryButton
            type="submit"
            width="full"
            disabled={!form.formState.isValid || isSubmitting}
            loading={isSubmitting}
          >
            {submitLabel}
          </PrimaryButton>
        </FormLayout>
      </form>
    </FormProvider>
  </ResponsiveModal>
)
