import Tag from '@gravity-ui/icons/Tag'
import ListUl from '@gravity-ui/icons/ListUl'
import Layers from '@gravity-ui/icons/Layers'
import MapPin from '@gravity-ui/icons/MapPin'
import Receipt from '@gravity-ui/icons/Receipt'
import Persons from '@gravity-ui/icons/Persons'
import Sliders from '@gravity-ui/icons/Sliders'
import { PageHeader, QuickAccessGrid, WidePageContainer } from '@repo/components'
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
    <PageHeader title="Inicio" description="Administración central de la plataforma." />

    <QuickAccessGrid items={QUICK_ACCESS} />
  </WidePageContainer>
)
