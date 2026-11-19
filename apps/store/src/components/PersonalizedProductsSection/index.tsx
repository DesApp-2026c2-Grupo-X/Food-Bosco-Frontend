import { Box, SimpleGrid } from '@chakra-ui/react'
import { SectionHeader } from '@repo/components'
import { ProductCard } from '../ProductCard'
import type { PersonalizedProductsSectionProps } from './types'

export const PersonalizedProductsSection = ({
  label,
  title,
  products,
  action,
}: PersonalizedProductsSectionProps) => {
  if (products.length === 0) return null

  return (
    <Box>
      <SectionHeader label={label} title={title} action={action} />
      <SimpleGrid columns={{ base: 2, md: 3, lg: 4 }} gap={{ base: '3', md: '5' }} marginTop="6">
        {products.map((entry) => (
          <ProductCard key={entry.product.id} product={entry.product} hint={entry.hint} />
        ))}
      </SimpleGrid>
    </Box>
  )
}
