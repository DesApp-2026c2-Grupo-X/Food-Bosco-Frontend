import { useMemo, useState } from 'react'
import { HStack, VStack } from '@chakra-ui/react'
import ListUl from '@gravity-ui/icons/ListUl'
import Layers from '@gravity-ui/icons/Layers'
import {
  EmptyState,
  FilterBar,
  GhostButton,
  Muted,
  PageTitle,
  Price,
  SearchInput,
  Strong,
  ToggleSwitch,
  WidePageContainer,
} from '@repo/components'
import { useBranchProducts } from '@repo/api'
import { formatPrice, type BranchProduct } from '@repo/domain'
import { ProductRecipeModal } from '../../components/ProductRecipeModal'

export const ProductsPage = () => {
  const { products, isLoading, isToggling, setAvailability } = useBranchProducts()
  const [search, setSearch] = useState('')
  const [recipeProduct, setRecipeProduct] = useState<BranchProduct | null>(null)

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return products
    return products.filter((item) => item.product.name.toLowerCase().includes(query))
  }, [products, search])

  return (
    <WidePageContainer>
      <VStack align="start" gap="1">
        <PageTitle>Productos de mi sucursal</PageTitle>
        <Muted>Activá o pausá lo que se vende en tu sucursal.</Muted>
      </VStack>

      <FilterBar>
        <SearchInput
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar producto..."
        />
      </FilterBar>

      {!isLoading && filtered.length === 0 ? (
        <EmptyState
          icon={<ListUl width={40} height={40} />}
          title="Sin productos"
          description="No hay productos que coincidan con la búsqueda."
        />
      ) : (
        <VStack align="stretch" gap="3">
          {filtered.map((item) => (
            <HStack
              key={item.product.id}
              justify="space-between"
              gap="4"
              bg="bg.panel"
              border="1px solid"
              borderColor="border.subtle"
              borderRadius="2xl"
              padding="4"
            >
              <VStack align="start" gap="0.5">
                <Strong>{item.product.name}</Strong>
                <Muted fontSize="sm">Categoría: {item.categoryName}</Muted>
                <Price>{formatPrice(item.product.price)}</Price>
                <GhostButton
                  size="sm"
                  color="brand.600"
                  marginTop="1"
                  onClick={() => setRecipeProduct(item)}
                >
                  <Layers width={16} height={16} /> Ver receta
                </GhostButton>
              </VStack>
              <VStack align="center" gap="1">
                <ToggleSwitch
                  checked={item.available}
                  onChange={(checked) => setAvailability(item.product.id, checked)}
                  disabled={isToggling}
                  ariaLabel={`Disponibilidad de ${item.product.name}`}
                />
                <Muted fontSize="xs">{item.available ? 'Activo' : 'Pausado'}</Muted>
              </VStack>
            </HStack>
          ))}
        </VStack>
      )}

      <ProductRecipeModal product={recipeProduct} onClose={() => setRecipeProduct(null)} />
    </WidePageContainer>
  )
}
