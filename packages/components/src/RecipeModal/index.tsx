import { Heading, HStack, Text, VStack } from '@chakra-ui/react'
import { Muted } from '../Muted'
import { ResponsiveModal } from '../ResponsiveModal'
import type { RecipeModalProps } from './types'

export const RecipeModal = ({
  title = 'Receta',
  description,
  items,
  open,
  onClose,
}: RecipeModalProps) => (
  <ResponsiveModal open={open} onClose={onClose}>
    <Heading as="h2" fontSize="xl" fontWeight="bold" marginBottom="2">
      {title}
    </Heading>
    {description ? (
      <Text color="fg.muted" fontSize="sm" marginBottom="4">
        {description}
      </Text>
    ) : null}
    {items.length === 0 ? (
      <Muted>Este producto no tiene receta cargada.</Muted>
    ) : (
      <VStack align="stretch" gap="2">
        {items.map((item, index) => (
          <HStack key={`${item.name}-${index}`} justify="space-between">
            <Text fontSize="sm">{item.name}</Text>
            <Muted fontSize="sm">
              {item.quantity} {item.unit}
            </Muted>
          </HStack>
        ))}
      </VStack>
    )}
  </ResponsiveModal>
)
