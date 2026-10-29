import { useState } from 'react'
import Tag from '@gravity-ui/icons/Tag'
import ListUl from '@gravity-ui/icons/ListUl'
import Layers from '@gravity-ui/icons/Layers'
import BoxIcon from '@gravity-ui/icons/Box'
import MapPin from '@gravity-ui/icons/MapPin'
import Receipt from '@gravity-ui/icons/Receipt'
import Persons from '@gravity-ui/icons/Persons'
import Sliders from '@gravity-ui/icons/Sliders'
import {
  AdjustStockModal,
  LowStockAlertsSection,
  PageHeader,
  QuickAccessGrid,
  Reveal,
  WidePageContainer,
  notifyWarning,
} from '@repo/components'
import { useBranches, useGlobalStock } from '@repo/api'
import { filterLowStockAlerts, type BranchStock } from '@repo/domain'
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
    id: 'stock',
    label: 'Stock',
    description: 'Inventario global',
    path: routes.stock,
    icon: BoxIcon,
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

export const HomePage = () => {
  const { stock = [], isAdjusting = false, adjust } = useGlobalStock() ?? {}
  const { branches = [] } = useBranches() ?? {}
  const [selected, setSelected] = useState<BranchStock | null>(null)

  const branchName = (branchId: string) =>
    branches.find((b) => b.id === branchId)?.name ?? `Sucursal ${branchId}`

  const alerts = filterLowStockAlerts(stock)

  const handleAdjust = async (delta: number, reason: string) => {
    if (!selected) return
    await adjust(selected.branchId, selected.ingredientId, delta, reason)
    const minQuantity = selected.ingredient?.minQuantity ?? 0
    const newQuantity = selected.quantity + delta
    if (minQuantity > 0 && newQuantity <= minQuantity) {
      notifyWarning({
        title: 'Stock en alerta',
        description: `${selected.ingredient?.name ?? 'El ingrediente'} quedó con ${newQuantity} ${selected.ingredient?.unit ?? ''} (mínimo: ${minQuantity}).`,
      })
    }
    setSelected(null)
  }

  return (
    <WidePageContainer>
      <PageHeader title="Inicio" description="Administración central de la plataforma." />

      <Reveal>
        <QuickAccessGrid items={QUICK_ACCESS} />
      </Reveal>

      {alerts.length > 0 ? (
        <Reveal delayMs={60}>
          <LowStockAlertsSection
            alerts={alerts}
            isAdjusting={isAdjusting}
            showBranch
            branchName={branchName}
            stockPath={routes.stock}
            onAdjust={setSelected}
          />
        </Reveal>
      ) : null}

      <AdjustStockModal
        ingredient={selected}
        isSubmitting={isAdjusting}
        onClose={() => setSelected(null)}
        onSubmit={handleAdjust}
      />
    </WidePageContainer>
  )
}
