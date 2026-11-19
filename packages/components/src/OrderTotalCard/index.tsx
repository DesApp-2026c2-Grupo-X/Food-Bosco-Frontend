import { Box, HStack, Stack } from '@chakra-ui/react'
import { formatPrice } from '@repo/domain'
import { Card } from '../Card'
import { Price, Strong, Subtle } from '../typography'
import type { OrderTotalCardProps } from './types'

export const OrderTotalCard = ({
  total,
  subtotal,
  discountTotal,
  appliedPromotions,
  subtitle,
}: OrderTotalCardProps) => {
  const hasDiscounts = discountTotal != null && discountTotal > 0

  return (
    <Card variant="subtle">
      <Stack gap="2">
        {hasDiscounts && subtotal != null ? (
          <>
            <HStack justify="space-between">
              <Subtle fontSize="sm">Subtotal</Subtle>
              <Price fontSize="sm" color="fg.muted">
                {formatPrice(subtotal)}
              </Price>
            </HStack>

            {appliedPromotions && appliedPromotions.length > 0 ? (
              appliedPromotions.map((promo) => (
                <HStack key={promo.promotionId} justify="space-between" fontSize="sm">
                  <HStack gap="1.5">
                    <Subtle color="success.fg">{promo.name}</Subtle>
                    {promo.code ? (
                      <Subtle fontSize="xs" color="fg.muted">
                        ({promo.code})
                      </Subtle>
                    ) : null}
                  </HStack>
                  <Price color="success.fg" fontWeight="medium">
                    -{formatPrice(promo.amount)}
                  </Price>
                </HStack>
              ))
            ) : (
              <HStack justify="space-between" fontSize="sm">
                <Subtle color="success.fg">Descuento aplicado</Subtle>
                <Price color="success.fg" fontWeight="medium">
                  -{formatPrice(discountTotal)}
                </Price>
              </HStack>
            )}
            <Box borderTopWidth="1px" borderColor="border.subtle" my="1" />
          </>
        ) : null}

        <HStack justify="space-between">
          <Strong fontSize="md">Total</Strong>
          <Price fontWeight="bold" fontSize="xl">
            {formatPrice(total)}
          </Price>
        </HStack>
        {subtitle ? <Subtle fontSize="sm">{subtitle}</Subtle> : null}
      </Stack>
    </Card>
  )
}
