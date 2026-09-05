import { Heading, HStack, Text, VStack } from '@chakra-ui/react'
import { Muted, ResponsiveModal } from '@repo/components'
import type { ProductRecipeModalProps } from './types'

export const ProductRecipeModal = ({ product, onClose }: ProductRecipeModalProps) => {
  const recipe = product?.product.recipe ?? []

  return (
    <ResponsiveModal open={product !== null} onClose={onClose}>
      <Heading as="h2" fontSize="xl" fontWeight="bold" marginBottom="2">
        Receta
      </Heading>
      {product ? (
        <Text color="fg.muted" fontSize="sm" marginBottom="4">
          {product.product.name}
        </Text>
      ) : null}
      {recipe.length === 0 ? (
        <Muted>Este producto no tiene receta cargada.</Muted>
      ) : (
        <VStack align="stretch" gap="2">
          {recipe.map((item) => (
            <HStack key={item.id} justify="space-between">
              <Text fontSize="sm">{item.ingredient?.name ?? '—'}</Text>
              <Muted fontSize="sm">
                {item.quantity} {item.ingredient?.unit ?? '—'}
              </Muted>
            </HStack>
          ))}
        </VStack>
      )}
    </ResponsiveModal>
  )
}
