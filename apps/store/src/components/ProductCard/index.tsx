import { Box, HStack, IconButton, Image, Link as ChakraLink } from '@chakra-ui/react'
import Plus from '@gravity-ui/icons/Plus'
import { NavLink } from 'react-router-dom'
import { productPath } from '../../routes'
import { formatPrice } from '@repo/domain'
import { Muted, Price, Strong } from '@repo/components'
import type { ProductCardProps } from './types'

export const ProductCard = ({ product }: ProductCardProps) => {
  return (
    <Box
      bg="bg.panel"
      border="1px solid"
      borderColor="border.subtle"
      borderRadius="2xl"
      overflow="hidden"
      transition="transform 150ms cubic-bezier(0.2, 0, 0, 1), box-shadow 150ms"
      _hover={{ transform: 'translateY(-2px)', boxShadow: 'md' }}
    >
      <ChakraLink asChild display="block">
        <NavLink to={productPath(product.id)} aria-label={product.name}>
          <Box aspectRatio="4 / 3" bg="bg.muted" overflow="hidden">
            {product.image ? (
              <Image
                src={product.image}
                alt={product.name}
                width="100%"
                height="100%"
                objectFit="cover"
                loading="lazy"
              />
            ) : null}
          </Box>
        </NavLink>
      </ChakraLink>

      <Box padding="4" paddingBottom="0">
        <ChakraLink asChild display="block">
          <NavLink to={productPath(product.id)}>
            <Strong color="fg">{product.name}</Strong>
            <Muted fontSize="sm" lineClamp={1} marginTop="0.5">
              {product.description}
            </Muted>
          </NavLink>
        </ChakraLink>
      </Box>

      <HStack padding="4" paddingTop="3" justify="space-between" align="center">
        <Price color="fg">{formatPrice(product.price)}</Price>
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
    </Box>
  )
}
