import { Box, SimpleGrid } from '@chakra-ui/react'
import { useMemo } from 'react'
import {
  EmptyState,
  LoadingState,
  Muted,
  PageHeader,
  PrimaryButton,
  SectionHeader,
  WidePageContainer,
} from '@repo/components'
import { useAddresses, usePromotionCatalog } from '@repo/api'
import {
  getPromotionCategoryId,
  splitPromotions,
  type Product,
  type PromotionCatalogItem,
} from '@repo/domain'
import { ProductCard } from '../../components/ProductCard'
import { PromotionCard } from '../../components/PromotionCard'
import { productPath, routes } from '../../routes'
import { useAddressStore } from '../../stores/addressStore'

const promotionCtaPath = (promotion: PromotionCatalogItem): string => {
  if (promotion.scope === 'PRODUCT' && promotion.products[0]) {
    return productPath(promotion.products[0].id)
  }
  const categoryId = getPromotionCategoryId(promotion, promotion.products)
  return categoryId ? `${routes.catalog}?cat=${categoryId}` : routes.catalog
}

export const PromotionsPage = () => {
  const selectedAddressId = useAddressStore((state) => state.selectedAddressId)
  const { addresses, isLoading: addressesLoading } = useAddresses()
  const selectedAddress = addresses.find((address) => address.id === selectedAddressId)
  const { promotions, isLoading, error, refetch } = usePromotionCatalog(
    selectedAddress?.latitude,
    selectedAddress?.longitude,
  )

  const { coupons, productPromotions } = useMemo(() => splitPromotions(promotions), [promotions])
  const promotedProducts = useMemo(() => {
    const byId = new Map<string, Product>()
    for (const promotion of productPromotions) {
      for (const product of promotion.products) {
        if (!product.available) continue
        if (!byId.has(product.id)) byId.set(product.id, product)
      }
    }
    return [...byId.values()]
  }, [productPromotions])

  if (addressesLoading || isLoading) {
    return (
      <WidePageContainer>
        <PageHeader
          title="Promociones"
          description="Cupones, beneficios y productos con descuento."
        />
        <Box marginTop="8">
          <LoadingState variant="skeleton" skeletonCount={4} skeletonHeight="220px" />
        </Box>
      </WidePageContainer>
    )
  }

  if (error) {
    return (
      <WidePageContainer>
        <PageHeader
          title="Promociones"
          description="Cupones, beneficios y productos con descuento."
        />
        <EmptyState
          title="No pudimos cargar las promociones"
          description="Revisá tu conexión e intentá de nuevo."
          action={<PrimaryButton onClick={() => void refetch()}>Reintentar</PrimaryButton>}
        />
      </WidePageContainer>
    )
  }

  if (promotions.length === 0) {
    return (
      <WidePageContainer>
        <PageHeader
          title="Promociones"
          description="Cupones, beneficios y productos con descuento."
        />
        <EmptyState
          title="No hay promociones vigentes"
          description="Volvé más tarde para descubrir nuevos beneficios."
        />
      </WidePageContainer>
    )
  }

  return (
    <WidePageContainer>
      <PageHeader
        title="Promociones"
        description="Cupones, beneficios y productos con descuento."
      />

      {coupons.length > 0 ? (
        <Box marginTop="8">
          <SectionHeader label="Beneficios" title="Cupones y beneficios" />
          <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} gap="4" marginTop="6">
            {coupons.map((promotion) => (
              <PromotionCard
                key={promotion.id}
                promotion={promotion}
                ctaPath={promotionCtaPath(promotion)}
              />
            ))}
          </SimpleGrid>
        </Box>
      ) : null}

      {promotedProducts.length > 0 ? (
        <Box marginTop="10">
          <SectionHeader label="Descuentos" title="Productos en promoción" />
          <Muted fontSize="sm" marginTop="2">
            Los precios con descuento se confirman en el carrito. Tocá un producto para ver sus
            condiciones.
          </Muted>
          <SimpleGrid
            columns={{ base: 2, md: 3, lg: 4 }}
            gap={{ base: '3', md: '5' }}
            marginTop="5"
          >
            {promotedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </SimpleGrid>
        </Box>
      ) : null}
    </WidePageContainer>
  )
}
