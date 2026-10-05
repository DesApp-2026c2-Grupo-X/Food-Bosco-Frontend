import { HStack, Text, VStack } from '@chakra-ui/react'
import { formatPercent } from '@repo/domain'
import { Card } from '../Card'
import { Muted, Strong } from '../typography'
import type { KpiCardProps } from './types'

const variationColor = (value: number): string => {
  if (value > 0) return 'success'
  if (value < 0) return 'danger'
  return 'fg.muted'
}

const variationArrow = (value: number): string => {
  if (value > 0) return '▲'
  if (value < 0) return '▼'
  return '—'
}

export const KpiCard = ({ title, value, variation, variationLabel, hint }: KpiCardProps) => (
  <Card>
    <VStack align="start" gap="1">
      <Muted fontSize="sm">{title}</Muted>
      <Strong fontSize="2xl">{value}</Strong>
      {variation != null ? (
        <HStack gap="1" color={variationColor(variation)}>
          <Text fontSize="xs" aria-hidden>
            {variationArrow(variation)}
          </Text>
          <Strong fontSize="sm">{formatPercent(variation)}</Strong>
          <Muted fontSize="xs">{variationLabel ?? 'vs. período anterior'}</Muted>
        </HStack>
      ) : null}
      {hint ? <Muted fontSize="xs">{hint}</Muted> : null}
    </VStack>
  </Card>
)
