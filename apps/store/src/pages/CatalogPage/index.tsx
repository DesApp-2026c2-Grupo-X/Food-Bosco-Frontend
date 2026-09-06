import { Box, SimpleGrid, Skeleton, VStack } from '@chakra-ui/react'
import GeoPin from '@gravity-ui/icons/GeoPin'
import Magnifier from '@gravity-ui/icons/Magnifier'
import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ChipCarousel, Muted, PageTitle, SearchInput, WidePageContainer } from '@repo/components'
import { EmptyState } from '@repo/components'
import { ProductCard } from '../../components/ProductCard'
import { useAddresses, useAvailableBranches, useCatalog } from '@repo/api'
import { useAddressStore } from '../../stores/addressStore'

export const CatalogPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState('')

  const selectedAddressId = useAddressStore((state) => state.selectedAddressId)
  const { addresses } = useAddresses()
  const selected = addresses.find((address) => address.id === selectedAddressId)
  const { branches, isLoading: branchesLoading } = useAvailableBranches(
    selected?.latitude,
    selected?.longitude,
  )
  const { categories, products, isLoading } = useCatalog(selected?.latitude, selected?.longitude)

  const noAvailableBranch = !branchesLoading && branches.length === 0

  const rawCategory = searchParams.get('cat')
  const selectedCategory = rawCategory || null

  const setCategory = (id: string | null) => {
    if (id === null) setSearchParams({})
    else setSearchParams({ cat: id })
  }

  const filtered = useMemo(
    () =>
      products.filter((product) => {
        if (selectedCategory !== null && product.categoryId !== selectedCategory) return false
        if (search && !product.name.toLowerCase().includes(search.trim().toLowerCase()))
          return false
        return true
      }),
    [products, selectedCategory, search],
  )

  if (noAvailableBranch) {
    return (
      <WidePageContainer>
        <VStack align="start" gap="1">
          <PageTitle>Catálogo</PageTitle>
          <Muted>Encontrá lo que se te antoje hoy.</Muted>
        </VStack>
        <EmptyState
          icon={<GeoPin width={40} height={40} />}
          title="No hay sucursales disponibles"
          description="Ninguna sucursal llega a tu zona por ahora."
        />
      </WidePageContainer>
    )
  }

  return (
    <WidePageContainer>
      <VStack align="start" gap="1">
        <PageTitle>Catálogo</PageTitle>
        <Muted>Encontrá lo que se te antoje hoy.</Muted>
      </VStack>

      <SearchInput
        placeholder="Buscar por nombre..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <ChipCarousel
        items={[
          {
            id: 'all',
            label: 'Todos',
            active: selectedCategory === null,
            onClick: () => setCategory(null),
          },
          ...categories.map((category) => ({
            id: category.id,
            label: category.name,
            active: selectedCategory === category.id,
            onClick: () => setCategory(category.id),
          })),
        ]}
      />

      {isLoading ? (
        <SimpleGrid columns={{ base: 2, md: 3, lg: 4 }} gap={{ base: '3', md: '5' }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} height="220px" borderRadius="2xl" />
          ))}
        </SimpleGrid>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Magnifier width={40} height={40} />}
          title="No encontramos nada"
          description="Probá con otra búsqueda u otra categoría."
        />
      ) : (
        <SimpleGrid columns={{ base: 2, md: 3, lg: 4 }} gap={{ base: '3', md: '5' }}>
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </SimpleGrid>
      )}

      <Box height="8" />
    </WidePageContainer>
  )
}
