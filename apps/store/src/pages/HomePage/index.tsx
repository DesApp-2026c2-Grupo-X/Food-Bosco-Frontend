import { useMemo } from 'react'
import { Box, Grid, Heading, HStack, Image, SimpleGrid, Text, VStack } from '@chakra-ui/react'
import Clock from '@gravity-ui/icons/Clock'
import Flame from '@gravity-ui/icons/Flame'
import GeoPin from '@gravity-ui/icons/GeoPin'
import LayoutCells from '@gravity-ui/icons/LayoutCells'
import Sliders from '@gravity-ui/icons/Sliders'
import { Link, useNavigate } from 'react-router-dom'
import {
  Card,
  ChipCarousel,
  Eyebrow,
  Footer,
  InverseButton,
  Lead,
  LoadingState,
  Muted,
  PrimaryButton,
  Reveal,
  SecondaryButton,
  SectionHeader,
  SectionTitle,
  Strong,
  TextLink,
  WidePageContainer,
} from '@repo/components'
import { ProductCard } from '../../components/ProductCard'
import { PromotionCard } from '../../components/PromotionCard'
import { ActiveOrderCard } from '../../components/ActiveOrderCard'
import { PersonalizedProductsSection } from '../../components/PersonalizedProductsSection'
import { ReorderSection } from '../../components/ReorderSection'
import { catalogForYouPath, FOR_YOU_CATEGORY, routes } from '../../routes'
import {
  useAddresses,
  useAvailableBranches,
  useCatalog,
  useHomeFeed,
  useOrders,
  useProfile,
  usePublicPromotions,
} from '@repo/api'
import { isHomeFeedEnabled } from '../../config/featureFlags'
import { useAddressStore } from '../../stores/addressStore'
import { useRecentViewsStore, type RecentProductView } from '../../stores/recentViewsStore'
import {
  formatDistance,
  getPromotionCategoryId,
  isActiveOrder,
  isBranchOpenNow,
  splitPromotions,
  type Category,
  type PersonalizedProduct,
  type Product,
  type Promotion,
} from '@repo/domain'
import {
  useHomePersonalization,
  type FavoriteBranchSummary,
  type NearestBranch,
} from './hooks/useHomePersonalization'

const STEPS = [
  { icon: LayoutCells, title: 'Elegí', text: 'Explorá el catálogo y encontrá tu antojo.' },
  { icon: Sliders, title: 'Configurá', text: 'Tamaño, extras y observaciones a tu gusto.' },
  { icon: Flame, title: 'Recibilo caliente', text: 'Te lo llevamos a tu dirección, recién hecho.' },
]

const EMPTY_RECENT_VIEWS: RecentProductView[] = []

export const HomePage = () => {
  const { user } = useProfile()
  const selectedAddressId = useAddressStore((state) => state.selectedAddressId)
  const { addresses } = useAddresses()
  const selected = addresses.find((address) => address.id === selectedAddressId)
  const { branches, isLoading: branchesLoading } = useAvailableBranches(
    selected?.latitude,
    selected?.longitude,
  )
  const { orders, isLoading: ordersLoading } = useOrders({ pollIntervalMs: 15000 })
  const {
    categories,
    products,
    isLoading: catalogLoading,
  } = useCatalog(selected?.latitude, selected?.longitude)
  const { promotions, isLoading: promotionsLoading } = usePublicPromotions()

  const homeFeedEnabled = isHomeFeedEnabled()
  const { feed: homeFeed, error: homeFeedError } = useHomeFeed({
    enabled: homeFeedEnabled,
    addressId: user ? selected?.id : null,
    lat: selected?.latitude,
    lng: selected?.longitude,
  })
  const remoteFeed = homeFeedEnabled && !homeFeedError ? homeFeed : null

  const recentViews = useRecentViewsStore((state) =>
    user?.id ? (state.viewsByUser[user.id] ?? EMPTY_RECENT_VIEWS) : EMPTY_RECENT_VIEWS,
  )
  const recentViewedIds = useMemo(() => recentViews.map((view) => view.productId), [recentViews])

  const personalization = useHomePersonalization({
    orders,
    products,
    categories,
    branches,
    promotions,
    selectedAddress: selected,
    recentViewedIds,
  })

  const hasHistory = remoteFeed?.hasHistory ?? personalization.hasHistory
  // Para usuarios nuevos el backend no devuelve `forYou`; se conserva el
  // catálogo local como "Los más pedidos".
  const recommendations =
    remoteFeed && remoteFeed.hasHistory ? remoteFeed.forYou : personalization.recommendations
  const discovery = remoteFeed?.discovery ?? personalization.discovery
  const reorderOrders = remoteFeed?.reorder ?? personalization.reorderOrders
  const orderedCategories = remoteFeed?.categories ?? personalization.orderedCategories
  const orderedPromotions = remoteFeed?.promotions ?? personalization.orderedPromotions
  const { coupons } = useMemo(() => splitPromotions(orderedPromotions), [orderedPromotions])
  const nearestBranch = remoteFeed?.nearestBranch ?? personalization.nearestBranch
  const topCategoryName = remoteFeed
    ? (remoteFeed.topCategory?.name ?? null)
    : personalization.topCategoryName
  const favoriteBranch = remoteFeed
    ? remoteFeed.favoriteBranch
      ? {
          branchId: remoteFeed.favoriteBranch.id,
          name: remoteFeed.favoriteBranch.name,
          orders: orders.filter(
            (order) =>
              order.status === 'DELIVERED' && order.branchId === remoteFeed.favoriteBranch?.id,
          ).length,
        }
      : null
    : personalization.favoriteBranch

  const activeOrders = orders.filter((order) => isActiveOrder(order.status))
  const hasAvailableBranch = !branchesLoading && branches.length > 0
  const reorderLoading = remoteFeed ? false : ordersLoading
  const catalogIsLoading = remoteFeed ? false : catalogLoading
  const promotionsAreLoading = remoteFeed ? false : promotionsLoading
  const recentViewedProducts: PersonalizedProduct[] = personalization.recentViewedProducts.map(
    (product) => ({
      product,
      reason: 'POPULAR',
      hint: 'Lo estás mirando',
      score: 0,
    }),
  )
  const deliveryHint = nearestBranch
    ? `${nearestBranch.branch.name} · ${formatDistance(nearestBranch.distanceMeters)}`
    : undefined

  return (
    <WidePageContainer>
      <Reveal>
        <Hero
          userFirstName={user?.firstName}
          greeting={personalization.greeting}
          addressLabel={selected?.label}
          hasHistory={hasHistory}
          topCategoryName={topCategoryName}
          deliveryHint={deliveryHint}
        />
      </Reveal>

      {ordersLoading ? (
        <Reveal>
          <VStack align="stretch" gap="4">
            <SectionTitle>Pedidos en curso</SectionTitle>
            <LoadingState variant="list" skeletonCount={1} skeletonHeight="120px" />
          </VStack>
        </Reveal>
      ) : activeOrders.length > 0 ? (
        <Reveal>
          <VStack align="stretch" gap="4">
            <SectionTitle>Pedidos en curso</SectionTitle>
            {activeOrders.map((order) => (
              <ActiveOrderCard key={order.id} order={order} />
            ))}
          </VStack>
        </Reveal>
      ) : null}

      {!reorderLoading && reorderOrders.length > 0 ? (
        <Reveal delayMs={40}>
          <ReorderSection orders={reorderOrders} />
        </Reveal>
      ) : null}

      {!hasHistory && recentViewedProducts.length > 0 ? (
        <Reveal delayMs={50}>
          <PersonalizedProductsSection
            label="Seguí explorando"
            title="Vistos hace poco"
            products={recentViewedProducts}
          />
        </Reveal>
      ) : null}

      {hasAvailableBranch ? (
        <Reveal delayMs={60}>
          <HomeCatalog
            categories={orderedCategories}
            isLoading={catalogIsLoading}
            personalized={hasHistory}
            recommendations={recommendations}
          />
        </Reveal>
      ) : null}

      {hasHistory && discovery.length > 0 ? (
        <Reveal delayMs={70}>
          <PersonalizedProductsSection
            label="Descubrí algo nuevo"
            title="Para probar"
            products={discovery}
            action={
              <TextLink to={routes.catalog} fontSize="sm">
                Explorar el catálogo
              </TextLink>
            }
          />
        </Reveal>
      ) : null}

      <Reveal delayMs={80}>
        <PromotionsSection
          promotions={coupons.slice(0, 2)}
          isLoading={promotionsAreLoading}
          personalized={hasHistory}
          products={products}
        />
      </Reveal>

      <Reveal delayMs={90}>
        <DeliveryBanner
          nearestBranch={nearestBranch}
          favoriteBranch={favoriteBranch}
          addressLabel={selected?.label}
        />
      </Reveal>

      <Reveal delayMs={100}>
        <Box>
          <SectionHeader label="Cómo funciona" title="Pedir es así de fácil" />
          <SimpleGrid columns={{ base: 1, sm: 3 }} gap={{ base: '4', md: '6' }} marginTop="6">
            {STEPS.map((step) => (
              <Card key={step.title} padding="6" interactive>
                <Box
                  color="brand.600"
                  bg="bg.muted"
                  borderRadius="full"
                  padding="2.5"
                  width="fit-content"
                  marginBottom="4"
                >
                  <step.icon width={22} height={22} />
                </Box>
                <Strong fontSize="lg">{step.title}</Strong>
                <Muted fontSize="sm" marginTop="1">
                  {step.text}
                </Muted>
              </Card>
            ))}
          </SimpleGrid>
        </Box>
      </Reveal>

      <Footer
        links={[
          { label: 'Catálogo', to: routes.catalog },
          { label: 'Sucursales', to: routes.branches },
          { label: 'Perfil', to: routes.profile },
        ]}
      />
    </WidePageContainer>
  )
}

interface HomeCatalogProps {
  categories: Category[]
  isLoading: boolean
  personalized: boolean
  recommendations: PersonalizedProduct[]
}

const HomeCatalog = ({
  categories,
  isLoading,
  personalized,
  recommendations,
}: HomeCatalogProps) => {
  const navigate = useNavigate()
  const popular = recommendations.map((entry) => entry.product)

  return (
    <VStack align="stretch" gap={{ base: '8', md: '12' }}>
      <Box>
        <SectionHeader
          label="Catálogo"
          title="Explorá por categoría"
          action={
            <TextLink to={routes.catalog} fontSize="sm">
              Ver todo
            </TextLink>
          }
        />
        {personalized ? (
          <Muted fontSize="sm" marginTop="2">
            Primero las categorías que más pedís.
          </Muted>
        ) : null}
        {isLoading ? (
          <LoadingState variant="list" skeletonCount={1} skeletonHeight="36px" />
        ) : (
          <ChipCarousel
            marginTop="4"
            items={[
              ...(personalized
                ? [
                    {
                      id: FOR_YOU_CATEGORY,
                      label: 'Para vos',
                      active: false,
                      onClick: () => navigate(catalogForYouPath),
                    },
                  ]
                : []),
              ...categories.map((category) => ({
                id: category.id,
                label: category.name,
                active: false,
                onClick: () => navigate(`${routes.catalog}?cat=${category.id}`),
              })),
            ]}
          />
        )}
      </Box>

      {personalized ? (
        isLoading ? (
          <Box>
            <SectionHeader label="Según tus pedidos" title="Para vos" />
            <LoadingState variant="skeleton" skeletonCount={4} skeletonHeight="220px" />
          </Box>
        ) : (
          <PersonalizedProductsSection
            label="Según tus pedidos"
            title="Para vos"
            products={recommendations.slice(0, 4)}
            action={
              <TextLink to={catalogForYouPath} fontSize="sm">
                Ver todo el catálogo
              </TextLink>
            }
          />
        )
      ) : (
        <Box>
          <SectionHeader
            label="Destacados"
            title="Los más pedidos"
            action={
              <TextLink to={routes.catalog} fontSize="sm">
                Ver todo el catálogo
              </TextLink>
            }
          />
          {isLoading ? (
            <LoadingState variant="skeleton" skeletonCount={4} skeletonHeight="220px" />
          ) : (
            <SimpleGrid
              columns={{ base: 2, md: 3, lg: 4 }}
              gap={{ base: '3', md: '5' }}
              marginTop="6"
            >
              {popular.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </SimpleGrid>
          )}
        </Box>
      )}
    </VStack>
  )
}

interface HeroProps {
  userFirstName?: string
  greeting: string
  addressLabel?: string
  hasHistory: boolean
  topCategoryName?: string | null
  deliveryHint?: string
}

const Hero = ({
  userFirstName,
  greeting,
  addressLabel,
  hasHistory,
  topCategoryName,
  deliveryHint,
}: HeroProps) => {
  return (
    <Card variant="subtle" position="relative" overflow="hidden" borderRadius="3xl" padding="0">
      <Box
        position="absolute"
        top="-120px"
        right="-60px"
        width="340px"
        height="340px"
        bg="brand.500"
        opacity="0.14"
        filter="blur(90px)"
        borderRadius="full"
      />
      <Box
        position="absolute"
        bottom="-140px"
        left="-80px"
        width="300px"
        height="300px"
        bg="accent.500"
        opacity="0.14"
        filter="blur(90px)"
        borderRadius="full"
      />

      <Grid
        templateColumns={{ base: '1fr', md: '1.15fr 1fr' }}
        gap={{ base: '6', md: '10' }}
        alignItems="center"
        padding={{ base: '8', md: '14' }}
        position="relative"
      >
        <VStack align="start" gap={{ base: '4', md: '5' }}>
          <HStack gap="2" color="brand.600" fontWeight="semibold" fontSize="sm">
            <GeoPin width={16} height={16} />
            <Text>
              {greeting} · Delivery a {addressLabel ?? 'tu dirección'}
            </Text>
          </HStack>
          <Heading
            as="h1"
            fontSize={{ base: '4xl', md: '6xl' }}
            fontWeight="bold"
            lineHeight="1.02"
            letterSpacing="-0.02em"
            textWrap="balance"
          >
            {userFirstName ? `¡Hola, ${userFirstName}!` : '¿Qué tenés ganas de comer hoy?'}
          </Heading>
          <Heading
            as="h2"
            fontSize={{ base: '2xl', md: '4xl' }}
            fontWeight="bold"
            lineHeight="1.05"
            letterSpacing="-0.02em"
            textWrap="balance"
            color="brand.600"
          >
            Comé rico, sin esperar.
          </Heading>
          <Lead>
            {hasHistory && topCategoryName
              ? `Volvé a pedir tus favoritos o descubrí algo nuevo en ${topCategoryName}. Armá tu pedido en minutos y recibilo caliente.`
              : 'Hamburguesas, pizzas y mucho más, listas cuando llegás. Armá tu pedido en minutos y recibilo caliente.'}
          </Lead>
          <HStack gap="3" flexWrap="wrap">
            <PrimaryButton asChild paddingX="7">
              <Link to={routes.catalog}>Pedir ahora</Link>
            </PrimaryButton>
            <SecondaryButton asChild paddingX="7">
              <Link to={routes.branches}>Ver sucursales</Link>
            </SecondaryButton>
          </HStack>
        </VStack>

        <Box display={{ base: 'none', md: 'block' }} position="relative">
          <Box
            borderRadius="2xl"
            overflow="hidden"
            aspectRatio="4 / 3"
            boxShadow="xl"
            transform="rotate(2deg)"
          >
            <Image
              src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80"
              alt="Comida recién hecha"
              width="100%"
              height="100%"
              objectFit="cover"
            />
          </Box>
          <Card
            position="absolute"
            bottom="-12px"
            left="6"
            display="flex"
            alignItems="center"
            borderRadius="full"
            paddingX="4"
            paddingY="2"
            gap="2"
            boxShadow="lg"
          >
            <Box color="brand.600" display="inline-flex">
              <Clock width={16} height={16} />
            </Box>
            <Strong fontSize="sm" lineClamp={1}>
              {deliveryHint ?? 'Entrega ~35 min'}
            </Strong>
          </Card>
        </Box>
      </Grid>
    </Card>
  )
}

interface PromotionsSectionProps {
  promotions: Promotion[]
  isLoading: boolean
  personalized: boolean
  products: Product[]
}

const PromotionsSection = ({
  promotions,
  isLoading,
  personalized,
  products,
}: PromotionsSectionProps) => {
  if (isLoading || promotions.length === 0) return null

  return (
    <Box>
      <SectionHeader
        label={personalized ? 'Según tus gustos' : 'Beneficios'}
        title={personalized ? 'Cupones para vos' : 'Cupones destacados'}
      />
      <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} gap="4" marginTop="6">
        {promotions.map((promo) => {
          const categoryId = getPromotionCategoryId(promo, products)
          const catalogHref = categoryId ? `${routes.catalog}?cat=${categoryId}` : routes.catalog

          return (
            <PromotionCard
              key={promo.id}
              promotion={promo}
              ctaPath={catalogHref}
              ctaLabel="Ver en el menú"
            />
          )
        })}
      </SimpleGrid>
    </Box>
  )
}

interface DeliveryBannerProps {
  nearestBranch: NearestBranch | null
  favoriteBranch: FavoriteBranchSummary | null
  addressLabel?: string
}

const DeliveryBanner = ({ nearestBranch, favoriteBranch, addressLabel }: DeliveryBannerProps) => {
  const branch = nearestBranch?.branch
  const isOpen = branch ? isBranchOpenNow(branch.hours) : false
  const title = branch ? `Tu pedido sale de ${branch.name}.` : 'Tu pedido, caliente y a tiempo.'
  const favoriteText =
    favoriteBranch?.name && favoriteBranch.orders > 1
      ? ` Pediste ${favoriteBranch.orders} veces ahí.`
      : ''

  return (
    <Box
      position="relative"
      overflow="hidden"
      borderRadius="3xl"
      bg="brand.600"
      color="white"
      padding={{ base: '8', md: '12' }}
    >
      <Box
        position="absolute"
        top="-80px"
        right="10%"
        width="240px"
        height="240px"
        bg="accent.500"
        opacity="0.35"
        filter="blur(80px)"
        borderRadius="full"
      />
      <Grid
        templateColumns={{ base: '1fr', md: '1fr auto' }}
        gap="6"
        alignItems="center"
        position="relative"
      >
        <VStack align="start" gap="2" maxW="lg">
          <Eyebrow color="brand.100" fontSize="sm">
            {branch ? (isOpen ? 'Abierta ahora' : 'Revisá sus horarios') : 'Sin vueltas'}
          </Eyebrow>
          <SectionTitle>{title}</SectionTitle>
          <Text color="brand.100">
            {nearestBranch
              ? `Queda a ${formatDistance(nearestBranch.distanceMeters)} de ${
                  addressLabel ?? 'tu dirección'
                } y está ${isOpen ? 'abierta' : 'cerrada'} ahora.${favoriteText} La elegimos automáticamente para que nada se enfríe de más.`
              : 'Elegimos la sucursal más cercana y abierta para que nada se enfríe de más.'}
          </Text>
        </VStack>
        <InverseButton asChild paddingX="7">
          <Link to={routes.branches}>Conocer sucursales</Link>
        </InverseButton>
      </Grid>
    </Box>
  )
}
