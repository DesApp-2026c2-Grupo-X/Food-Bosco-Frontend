import { Box, SimpleGrid } from '@chakra-ui/react'
import GeoPin from '@gravity-ui/icons/GeoPin'
import Magnifier from '@gravity-ui/icons/Magnifier'
import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  ChipCarousel,
  EmptyState,
  LoadingState,
  PageHeader,
  Reveal,
  SearchInput,
  WidePageContainer,
} from '@repo/components'
import { ProductCard } from '../../components/ProductCard'
import {
  useAddresses,
  useAuthStore,
  useAvailableBranches,
  useCatalog,
  useOrders,
} from '@repo/api'
import { buildTasteProfile, recommendProducts, type PersonalizedProduct } from '@repo/domain'
import { useAddressStore } from '../../stores/addressStore'
import { FOR_YOU_CATEGORY } from '../../routes'

export const CatalogPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState('')

  const selectedAddressId = useAddressStore((state) => state.selectedAddressId)
  const accessToken = useAuthStore((state) => state.accessToken)
  const { addresses } = useAddresses()
  const selected = addresses.find((address) => address.id === selectedAddressId)
  const { branches, isLoading: branchesLoading } = useAvailableBranches(
    selected?.latitude,
    selected?.longitude,
  )
  const {
    categories,
    products,
    isLoading: catalogLoading,
  } = useCatalog(selected?.latitude, selected?.longitude)
  const { orders, isLoading: ordersLoading } = useOrders({ skip: !accessToken })

  const noAvailableBranch = !branchesLoading && branches.length === 0

  const rawCategory = searchParams.get('cat')
  const selectedCategory = rawCategory || null
  const isForYou = selectedCategory === FOR_YOU_CATEGORY

  const setCategory = (id: string | null) => {
    if (id === null) setSearchParams({})
    else setSearchParams({ cat: id })
  }

  const forYouEntries = useMemo<PersonalizedProduct[] | null>(() => {
    if (!isForYou) return null

    const profile = buildTasteProfile(orders, products)
    return recommendProducts({
      products,
      profile,
      limit: Math.max(products.length, 1),
    })
  }, [isForYou, orders, products])

  const orderedProducts = useMemo(
    () => forYouEntries?.map((entry) => entry.product) ?? products,
    [forYouEntries, products],
  )

  const hintsByProduct = useMemo(
    () => new Map((forYouEntries ?? []).map((entry) => [entry.product.id, entry.hint])),
    [forYouEntries],
  )

  const filtered = useMemo(
    () =>
      orderedProducts.filter((product) => {
        if (selectedCategory !== null && !isForYou && product.categoryId !== selectedCategory) {
          return false
        }
        if (search && !product.name.toLowerCase().includes(search.trim().toLowerCase()))
          return false
        return true
      }),
    [isForYou, orderedProducts, search, selectedCategory],
  )

  const isLoading = catalogLoading || (isForYou && ordersLoading)

  if (noAvailableBranch) {
    return (
      <WidePageContainer>
        <PageHeader title="Catálogo" description="Encontrá lo que se te antoje hoy." />
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
      <PageHeader
        title="Catálogo"
        description={
          isForYou
            ? 'Ordenado según tus consumos.'
            : 'Encontrá lo que se te antoje hoy.'
        }
      />

      <SearchInput
        placeholder="Buscar por nombre..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <ChipCarousel
        items={[
          {
            id: FOR_YOU_CATEGORY,
            label: 'Para vos',
            active: isForYou,
            onClick: () => setCategory(FOR_YOU_CATEGORY),
          },
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
        <LoadingState variant="skeleton" />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Magnifier width={40} height={40} />}
          title="No encontramos nada"
          description="Probá con otra búsqueda u otra categoría."
        />
      ) : (
        <Reveal>
          <SimpleGrid columns={{ base: 2, md: 3, lg: 4 }} gap={{ base: '3', md: '5' }}>
            {filtered.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                hint={isForYou ? (hintsByProduct.get(product.id) ?? undefined) : undefined}
              />
            ))}
          </SimpleGrid>
        </Reveal>
      )}

      <Box height="8" />
    </WidePageContainer>
  )
}
