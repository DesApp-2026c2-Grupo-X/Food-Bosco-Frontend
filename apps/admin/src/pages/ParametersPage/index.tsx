import { useState } from 'react'
import { HStack, VStack } from '@chakra-ui/react'
import Sliders from '@gravity-ui/icons/Sliders'
import {
  DataTable,
  type DataTableColumn,
  EmptyState,
  GhostButton,
  Muted,
  PageTitle,
  Strong,
  WidePageContainer,
} from '@repo/components'
import { useParameters } from '@repo/api'
import type { Parameter } from '@repo/domain'
import { ParameterFormModal } from '../../components/ParameterFormModal'

const PARAMETER_LABELS: Record<string, string> = {
  MAX_DISTANCE_KM: 'Distancia máxima para una sucursal disponible',
  BASE_PREP_MIN: 'Tiempo base de preparación',
  AVG_SPEED_KMH: 'Velocidad promedio de traslado',
}

export const ParametersPage = () => {
  const { parameters, isLoading, isMutating, update } = useParameters()
  const [selected, setSelected] = useState<Parameter | null>(null)

  const columns: DataTableColumn<Parameter>[] = [
    {
      key: 'key',
      header: 'Parámetro',
      render: (parameter) => <Strong>{PARAMETER_LABELS[parameter.key] ?? parameter.key}</Strong>,
    },
    {
      key: 'value',
      header: 'Valor',
      render: (parameter) => (
        <Strong>
          {parameter.value} {parameter.unit}
        </Strong>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (parameter) => (
        <HStack justify="end">
          <GhostButton size="sm" onClick={() => setSelected(parameter)}>
            Editar
          </GhostButton>
        </HStack>
      ),
    },
  ]

  return (
    <WidePageContainer>
      <VStack align="start" gap="1">
        <PageTitle>Parámetros del sistema</PageTitle>
        <Muted>Modificá los valores usados por las decisiones del sistema.</Muted>
      </VStack>

      {!isLoading && parameters.length === 0 ? (
        <EmptyState
          icon={<Sliders width={40} height={40} />}
          title="Sin parámetros"
          description="No hay parámetros para mostrar."
        />
      ) : (
        <DataTable
          columns={columns}
          rows={parameters}
          getRowKey={(parameter) => parameter.key}
          isLoading={isLoading}
          emptyTitle="Sin parámetros"
          emptyDescription="No hay parámetros para mostrar."
        />
      )}

      {selected ? (
        <ParameterFormModal
          parameter={selected}
          isSubmitting={isMutating}
          onClose={() => setSelected(null)}
          onSubmit={async (value) => {
            await update(selected.key, value)
            setSelected(null)
          }}
        />
      ) : null}
    </WidePageContainer>
  )
}
