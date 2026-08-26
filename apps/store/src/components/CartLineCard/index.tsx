import { HStack, Image, VStack } from '@chakra-ui/react'
import TrashBin from '@gravity-ui/icons/TrashBin'
import { lineTotal, lineUnitPrice } from '../../stores/cartStore'
import { formatPrice } from '@repo/domain'
import { GhostButton, Muted, Price, QuantityStepper, Strong, Subtle } from '@repo/components'
import type { CartLineCardProps } from './types'

export const CartLineCard = ({ line, onQuantityChange, onRemove }: CartLineCardProps) => {
  const optionsLabel = line.options.map((o) => o.option).join(' · ')

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
      <Image
        src={line.image}
        alt={line.name}
        width="64px"
        height="64px"
        borderRadius="xl"
        objectFit="cover"
        flexShrink={0}
      />
      <VStack align="start" gap="1" flex="1" minWidth="0">
        <Strong fontSize="sm" lineClamp={1}>
          {line.name}
        </Strong>
        {optionsLabel ? (
          <Muted fontSize="xs" lineClamp={2}>
            {optionsLabel}
          </Muted>
        ) : null}
        {line.notes ? (
          <Subtle fontSize="xs" lineClamp={1}>
            Nota: {line.notes}
          </Subtle>
        ) : null}
        <Muted fontSize="xs" fontVariantNumeric="tabular-nums">
          {formatPrice(lineUnitPrice(line))} c/u
        </Muted>
        <GhostButton
          size="2xs"
          color="fg.subtle"
          paddingX="0"
          _hover={{ color: 'danger' }}
          onClick={() => onRemove(line.id)}
        >
          <TrashBin width={14} height={14} />
          Eliminar
        </GhostButton>
      </VStack>
      <VStack align="end" gap="2">
        <Price>{formatPrice(lineTotal(line))}</Price>
        <QuantityStepper
          value={line.quantity}
          onChange={(value) => onQuantityChange(line.id, value)}
        />
      </VStack>
    </HStack>
  )
}
