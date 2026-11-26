import { Badge, HStack, VStack } from '@chakra-ui/react'
import { Link } from 'react-router-dom'
import { describePromotion, promotionConditionLabels, promotionValidityLabel } from '@repo/domain'
import { Card, Muted, PrimaryButton, Strong } from '@repo/components'
import type { PromotionCardProps } from './types'

export const PromotionCard = ({
  promotion,
  ctaPath,
  ctaLabel = 'Ver en el menú',
}: PromotionCardProps) => {
  const badge = promotion.badge ?? describePromotion(promotion)
  const conditions = promotionConditionLabels(promotion)

  return (
    <Card padding="5" interactive variant="subtle">
      <HStack justify="space-between" align="start" gap="3">
        <Badge colorPalette="brand" size="sm">
          {badge}
        </Badge>
        {promotion.code ? (
          <Badge colorPalette="accent" size="sm" variant="subtle">
            {promotion.code}
          </Badge>
        ) : null}
      </HStack>

      <Strong fontSize="md" marginTop="3" display="block">
        {promotion.name}
      </Strong>
      <Muted fontSize="sm" marginTop="1" minHeight="40px">
        {promotion.description || describePromotion(promotion)}
      </Muted>

      <VStack align="start" gap="1" marginTop="3">
        <Muted fontSize="xs">
          {promotionValidityLabel(promotion.startDate, promotion.endDate)}
        </Muted>
        {conditions.map((condition) => (
          <Muted key={condition} fontSize="xs">
            {condition}
          </Muted>
        ))}
      </VStack>

      <PrimaryButton size="sm" asChild width="full" marginTop="4">
        <Link to={ctaPath}>{ctaLabel}</Link>
      </PrimaryButton>
    </Card>
  )
}
