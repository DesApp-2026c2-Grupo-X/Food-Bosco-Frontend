import { useState } from 'react'
import { HStack } from '@chakra-ui/react'
import {
  DataTable,
  type DataTableColumn,
  GhostButton,
  PageHeader,
  Strong,
  WidePageContainer,
} from '@repo/components'
import { useParameters } from '@repo/api'
import { PARAMETER_LABELS, type Parameter } from '@repo/domain'
import { ParameterFormModal } from '../../components/ParameterFormModal'

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
      <PageHeader
        title="Parámetros del sistema"
        description="Modificá los valores usados por las decisiones del sistema."
      />

      <DataTable
        columns={columns}
        rows={parameters}
        getRowKey={(parameter) => parameter.key}
        isLoading={isLoading}
        emptyTitle="Sin parámetros"
        emptyDescription="No hay parámetros para mostrar."
      />

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
