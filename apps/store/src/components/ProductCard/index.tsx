import { Badge, Box, HStack, IconButton, Text } from '@chakra-ui/react'
import Plus from '@gravity-ui/icons/Plus'
import { NavLink } from 'react-router-dom'
import { productPath } from '../../routes'
import {
  formatPrice,
  hasEstimatedPrice,
  promotionBadgeAriaLabel,
  type ProductPromotionPreview,
} from '@repo/domain'
import { Card, LoadingImage, MenuLink, Muted, Price, Strong } from '@repo/components'
import { isProductPromotionsEnabled } from '../../config/featureFlags'
import type { ProductCardProps } from './types'

const promotionNote = (promotion: ProductPromotionPreview): string | null => {
  if (!promotion.conditionsMet) {
    return promotion.minQuantity > 1
      ? `Mínimo ${promotion.minQuantity} unidades`
      : 'Sujeto a compra mínima'
  }
  if (promotion.maxDiscount != null) {
    return `Tope ${formatPrice(promotion.maxDiscount)}`
  }
  return null
}

export const ProductCard = ({
  product,
  hint,
  showPromotion = isProductPromotionsEnabled(),
}: ProductCardProps) => {
  const promotion = showPromotion ? (product.promotion ?? null) : null
  const estimatedPrice =
    promotion && hasEstimatedPrice(promotion) ? promotion.estimatedUnitPrice : null
  const note = promotion ? promotionNote(promotion) : null
  const extraPromotions = promotion ? Math.max(0, promotion.promotionCount - 1) : 0

  return (
    <Card padding="0" overflow="hidden" interactive>
      <MenuLink to={productPath(product.id)} display="block" aria-label={product.name}>
        <Box position="relative" aspectRatio="4 / 3" overflow="hidden">
          <LoadingImage src={product.image} alt={product.name} loading="lazy" />
          {promotion ? (
            <Badge
              position="absolute"
              top="2"
              left="2"
              colorPalette="brand"
              size="sm"
              aria-label={promotionBadgeAriaLabel(promotion)}
            >
              {promotion.badge}
            </Badge>
          ) : null}
        </Box>
      </MenuLink>

      <Box padding="4" paddingBottom="0">
        <MenuLink to={productPath(product.id)} display="block">
          <Strong color="fg">{product.name}</Strong>
          <Muted fontSize="sm" lineClamp={1} marginTop="0.5">
            {product.description}
          </Muted>
          {hint ? (
            <Muted color="brand.600" fontSize="xs" fontWeight="medium" lineClamp={1} marginTop="1">
              {hint}
            </Muted>
          ) : null}
        </MenuLink>

        {promotion ? (
          <Box minHeight={note ? '34px' : '18px'} marginTop="1.5">
            <Muted color="brand.600" fontSize="xs" fontWeight="medium" lineClamp={1}>
              {promotion.name}
              {extraPromotions > 0 ? ` · +${extraPromotions} promos` : ''}
            </Muted>
            {note ? (
              <Muted fontSize="2xs" lineClamp={1}>
                {note}
              </Muted>
            ) : null}
          </Box>
        ) : null}
      </Box>

      <HStack padding="4" paddingTop="3" justify="space-between" align="center">
        {estimatedPrice != null && promotion ? (
          <HStack gap="2" align="baseline">
            <Text
              as="span"
              textDecoration="line-through"
              color="fg.subtle"
              fontSize="sm"
              aria-label="Precio anterior"
            >
              {formatPrice(promotion.originalPrice)}
            </Text>
            <Price color="fg">{formatPrice(estimatedPrice)}</Price>
          </HStack>
        ) : (
          <Price color="fg">{formatPrice(product.price)}</Price>
        )}
        <IconButton
          asChild
          aria-label={`Ver ${product.name}`}
          size="sm"
          borderRadius="full"
          bg="brand.600"
          color="white"
          _hover={{ bg: 'brand.700' }}
        >
          <NavLink to={productPath(product.id)}>
            <Plus width={16} height={16} />
          </NavLink>
        </IconButton>
      </HStack>
    </Card>
  )
}
