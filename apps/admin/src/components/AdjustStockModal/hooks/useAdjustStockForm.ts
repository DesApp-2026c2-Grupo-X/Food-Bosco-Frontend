import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { adjustStockSchema, type AdjustStockForm, type BranchStock } from '@repo/domain'

const EMPTY: AdjustStockForm = { delta: '', reason: '' }

export const useAdjustStockForm = (ingredient: BranchStock | null) => {
  const form = useForm<AdjustStockForm>({
    resolver: zodResolver(adjustStockSchema),
    defaultValues: EMPTY,
    mode: 'onTouched',
    reValidateMode: 'onChange',
  })

  useEffect(() => {
    if (ingredient) form.reset(EMPTY)
  }, [ingredient, form])

  return form
}
