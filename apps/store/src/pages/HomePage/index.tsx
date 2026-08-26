import { Box, Grid, Heading, HStack, Image, SimpleGrid, Text, VStack } from '@chakra-ui/react'
import Clock from '@gravity-ui/icons/Clock'
import Flame from '@gravity-ui/icons/Flame'
import GeoPin from '@gravity-ui/icons/GeoPin'
import LayoutCells from '@gravity-ui/icons/LayoutCells'
import Sliders from '@gravity-ui/icons/Sliders'
import { Link, useNavigate } from 'react-router-dom'
import {
  ChipCarousel,
  Eyebrow,
  Footer,
  InverseButton,
  Lead,
  Muted,
  PrimaryButton,
  SecondaryButton,
  SectionTitle,
  Strong,
  TextLink,
  WidePageContainer,
} from '@repo/components'
import { ProductCard } from '../../components/ProductCard'
import { SectionHeader } from '@repo/components'
import { routes } from '../../routes'
import { useCatalog } from '@repo/api'
import { useProfile } from '@repo/api'
import { useAddressStore } from '../../stores/addressStore'

const STEPS = [
  { icon: LayoutCells, title: 'Elegí', text: 'Explorá el catálogo y encontrá tu antojo.' },
  { icon: Sliders, title: 'Configurá', text: 'Tamaño, extras y observaciones a tu gusto.' },
  { icon: Flame, title: 'Recibilo caliente', text: 'Te lo llevamos a tu dirección, recién hecho.' },
]

export const HomePage = () => {
  const { user } = useProfile()
  const selectedAddressId = useAddressStore((state) => state.selectedAddressId)

  return (
    <WidePageContainer>
      <Hero userFirstName={user?.firstName} />

      {selectedAddressId != null ? <HomeCatalog /> : null}

      <DeliveryBanner />

      <Box>
        <SectionHeader label="Cómo funciona" title="Pedir es así de fácil" />
        <SimpleGrid columns={{ base: 1, sm: 3 }} gap={{ base: '4', md: '6' }} marginTop="6">
          {STEPS.map((step) => (
            <Box
              key={step.title}
              bg="bg.panel"
              border="1px solid"
              borderColor="border.subtle"
              borderRadius="2xl"
              padding="6"
            >
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
            </Box>
          ))}
        </SimpleGrid>
      </Box>

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

const HomeCatalog = () => {
  const { categories, products } = useCatalog()
  const navigate = useNavigate()
  const featured = products.slice(0, 8)

  return (
    <>
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
        <ChipCarousel
          marginTop="4"
          items={categories.map((category) => ({
            id: category.id,
            label: category.name,
            active: false,
            onClick: () => navigate(`${routes.catalog}?cat=${category.id}`),
          }))}
        />
      </Box>

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
        <SimpleGrid columns={{ base: 2, md: 3, lg: 4 }} gap={{ base: '3', md: '5' }} marginTop="6">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </SimpleGrid>
      </Box>
    </>
  )
}

const Hero = ({ userFirstName }: { userFirstName?: string }) => {
  return (
    <Box
      position="relative"
      overflow="hidden"
      borderRadius="3xl"
      bg="bg.subtle"
      border="1px solid"
      borderColor="border.subtle"
    >
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
            <Text>Delivery a tu dirección</Text>
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
            Hamburguesas, pizzas y mucho más, listas cuando llegás. Armá tu pedido en minutos y
            recibilo caliente.
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
          <HStack
            position="absolute"
            bottom="-12px"
            left="6"
            bg="bg.panel"
            border="1px solid"
            borderColor="border.subtle"
            borderRadius="full"
            paddingX="4"
            paddingY="2"
            gap="2"
            boxShadow="lg"
          >
            <Box color="brand.600" display="inline-flex">
              <Clock width={16} height={16} />
            </Box>
            <Strong fontSize="sm">Entrega ~35 min</Strong>
          </HStack>
        </Box>
      </Grid>
    </Box>
  )
}

const DeliveryBanner = () => {
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
            Sin vueltas
          </Eyebrow>
          <SectionTitle>Tu pedido, caliente y a tiempo.</SectionTitle>
          <Text color="brand.100">
            Elegimos la sucursal más cercana y abierta para que nada se enfríe de más.
          </Text>
        </VStack>
        <InverseButton asChild paddingX="7">
          <Link to={routes.branches}>Conocer sucursales</Link>
        </InverseButton>
      </Grid>
    </Box>
  )
}
