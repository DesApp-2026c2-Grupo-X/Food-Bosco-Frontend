import { Box, SimpleGrid, VStack, Link as ChakraLink } from '@chakra-ui/react'
import Tag from '@gravity-ui/icons/Tag'
import ListUl from '@gravity-ui/icons/ListUl'
import Layers from '@gravity-ui/icons/Layers'
import MapPin from '@gravity-ui/icons/MapPin'
import Receipt from '@gravity-ui/icons/Receipt'
import Star from '@gravity-ui/icons/Star'
import Persons from '@gravity-ui/icons/Persons'
import Sliders from '@gravity-ui/icons/Sliders'
import { Link } from 'react-router-dom'
import { Muted, PageTitle, Strong, WidePageContainer } from '@repo/components'
import { routes } from '../../routes'

const QUICK_ACCESS = [
  {
    id: 'categories',
    label: 'Categorías',
    description: 'Definir el menú',
    path: routes.categories,
    icon: Tag,
  },
  {
    id: 'products',
    label: 'Productos',
    description: 'Catálogo global',
    path: routes.products,
    icon: ListUl,
  },
  {
    id: 'ingredients',
    label: 'Ingredientes',
    description: 'Materias primas',
    path: routes.ingredients,
    icon: Layers,
  },
  {
    id: 'branches',
    label: 'Sucursales',
    description: 'Locales y horarios',
    path: routes.branches,
    icon: MapPin,
  },
  {
    id: 'orders',
    label: 'Pedidos',
    description: 'Operar estados',
    path: routes.orders,
    icon: Receipt,
  },
  {
    id: 'promotions',
    label: 'Promociones',
    description: 'Información general',
    path: routes.promotions,
    icon: Star,
  },
  {
    id: 'staff',
    label: 'Personal',
    description: 'Colaboradores',
    path: routes.staff,
    icon: Persons,
  },
  {
    id: 'parameters',
    label: 'Parámetros',
    description: 'Reglas del sistema',
    path: routes.parameters,
    icon: Sliders,
  },
]

export const HomePage = () => (
  <WidePageContainer>
    <VStack align="start" gap="1">
      <PageTitle>Inicio</PageTitle>
      <Muted>Administración central de la plataforma.</Muted>
    </VStack>

    <SimpleGrid columns={{ base: 2, md: 4 }} gap="4">
      {QUICK_ACCESS.map((item) => {
        const Icon = item.icon
        return (
          <ChakraLink
            asChild
            key={item.id}
            display="block"
            bg="bg.panel"
            border="1px solid"
            borderColor="border.subtle"
            borderRadius="2xl"
            padding="5"
            _hover={{ borderColor: 'border.emphasized' }}
          >
            <Link to={item.path}>
              <Box color="brand.600" marginBottom="3">
                <Icon width={26} height={26} />
              </Box>
              <Strong>{item.label}</Strong>
              <Muted fontSize="sm">{item.description}</Muted>
            </Link>
          </ChakraLink>
        )
      })}
    </SimpleGrid>
  </WidePageContainer>
)
