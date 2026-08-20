import { Heading, Text } from '@chakra-ui/react'
import { FormProvider } from 'react-hook-form'
import { FormField, FormLayout, PrimaryButton, ResponsiveModal } from '@repo/components'
import { useAdjustStockForm } from './hooks/useAdjustStockForm'
import type { AdjustStockModalProps } from './types'

export const AdjustStockModal = ({
  ingredient,
  isSubmitting = false,
  onClose,
  onSubmit,
}: AdjustStockModalProps) => {
  const form = useAdjustStockForm(ingredient)

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit(Number(values.delta), values.reason ?? '')
  })

  return (
    <ResponsiveModal open={ingredient !== null} onClose={onClose}>
      <FormProvider {...form}>
        <form onSubmit={handleSubmit}>
          <Heading as="h2" fontSize="xl" fontWeight="bold" marginBottom="2">
            Ajustar stock
          </Heading>
          {ingredient ? (
            <Text color="fg.muted" fontSize="sm" marginBottom="4">
              {ingredient.ingredient.name} · Actual: {ingredient.quantity}{' '}
              {ingredient.ingredient.unit}
            </Text>
          ) : null}
          <FormLayout>
            <FormField
              name="delta"
              label="Ajuste (+ / -)"
              inputMode="numeric"
              placeholder="Ej: 5 o -3"
            />
            <FormField
              name="reason"
              label="Motivo (opcional)"
              placeholder="Conteo físico, reposición…"
            />
            <PrimaryButton
              type="submit"
              width="full"
              disabled={!form.formState.isValid || isSubmitting}
              loading={isSubmitting}
              marginTop="2"
            >
              Guardar ajuste
            </PrimaryButton>
          </FormLayout>
        </form>
      </FormProvider>
    </ResponsiveModal>
  )
}
