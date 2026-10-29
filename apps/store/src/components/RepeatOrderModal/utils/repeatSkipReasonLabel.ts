import type { RepeatSkipReason } from '@repo/domain'

const REPEAT_SKIP_REASON_LABELS: Record<RepeatSkipReason, string> = {
  PRODUCT_NOT_FOUND: 'Ya no existe en el catálogo',
  PRODUCT_UNAVAILABLE: 'No está disponible en este momento',
  OPTION_UNAVAILABLE: 'Una opción elegida ya no está disponible',
}

export const repeatSkipReasonLabel = (reason: RepeatSkipReason): string =>
  REPEAT_SKIP_REASON_LABELS[reason] ?? 'No se pudo agregar'
