import { Box, HStack, Image, VStack } from '@chakra-ui/react'
import TrashBin from '@gravity-ui/icons/TrashBin'
import { cartLineTotal, cartLineUnitPrice } from '@repo/domain'
import { formatPrice } from '@repo/domain'
import { GhostButton, Muted, Price, QuantityStepper, Strong, Subtle } from '@repo/components'
import type { CartLineCardProps } from './types'

export const CartLineCard = ({ item, onQuantityChange, onRemove }: CartLineCardProps) => {
  const optionsLabel = item.options.map((option) => option.name).join(' · ')

  return (
    <HStack
      gap="3"
      align="start"
      bg="bg.panel"
      border="1px solid"
      borderColor="border.subtle"
      borderRadius="2xl"
      padding="3"
    >
      <Box
        width="64px"
        height="64px"
        borderRadius="xl"
        overflow="hidden"
        bg="bg.muted"
        flexShrink={0}
      >
        {item.product?.image ? (
          <Image
            src={item.product.image}
            alt={item.product.name}
            width="100%"
            height="100%"
            objectFit="cover"
          />
        ) : null}
      </Box>
      <VStack align="start" gap="1" flex="1" minWidth="0">
        <Strong fontSize="sm" lineClamp={1}>
          {item.product?.name}
        </Strong>
        {optionsLabel ? (
          <Muted fontSize="xs" lineClamp={2}>
            {optionsLabel}
          </Muted>
        ) : null}
        {item.observations ? (
          <Subtle fontSize="xs" lineClamp={1}>
            Nota: {item.observations}
          </Subtle>
        ) : null}
        <Muted fontSize="xs" fontVariantNumeric="tabular-nums">
          {formatPrice(cartLineUnitPrice(item))} c/u
        </Muted>
        <GhostButton
          size="2xs"
          color="fg.subtle"
          paddingX="0"
          _hover={{ color: 'danger' }}
          onClick={() => onRemove(item.id)}
        >
          <TrashBin width={14} height={14} />
          Eliminar
        </GhostButton>
      </VStack>
      <VStack align="end" gap="2">
        <Price>{formatPrice(cartLineTotal(item))}</Price>
        <QuantityStepper
          value={item.quantity}
          onChange={(value) => onQuantityChange(item.id, value)}
        />
      </VStack>
    </HStack>
  )
}
