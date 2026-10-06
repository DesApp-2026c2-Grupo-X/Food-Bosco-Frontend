import { HStack, Input, VStack } from '@chakra-ui/react'
import { REPORT_PERIOD_OPTIONS } from '@repo/domain'
import { SelectField } from '../SelectField'
import { Muted } from '../typography'
import type { ReportFiltersProps } from './types'

const PERIOD_OPTIONS = REPORT_PERIOD_OPTIONS.map((option) => ({
  value: option.value,
  label: option.label,
}))

export const ReportFilters = ({
  preset,
  onPresetChange,
  from,
  to,
  onFromChange,
  onToChange,
  branchId,
  onBranchChange,
  branches,
  status,
  onStatusChange,
  statusOptions,
}: ReportFiltersProps) => (
  <HStack gap="3" wrap="wrap" align="end">
    <VStack align="start" gap="1">
      <Muted fontSize="xs">Período</Muted>
      <SelectField
        value={preset}
        onChange={(value) => onPresetChange(value as ReportFiltersProps['preset'])}
        options={PERIOD_OPTIONS}
        width="filterControlSm"
      />
    </VStack>

    {preset === 'custom' ? (
      <>
        <VStack align="start" gap="1">
          <Muted fontSize="xs">Desde</Muted>
          <Input
            type="date"
            size="md"
            value={from}
            max={to || undefined}
            onChange={(event) => onFromChange(event.currentTarget.value)}
          />
        </VStack>
        <VStack align="start" gap="1">
          <Muted fontSize="xs">Hasta</Muted>
          <Input
            type="date"
            size="md"
            value={to}
            min={from || undefined}
            onChange={(event) => onToChange(event.currentTarget.value)}
          />
        </VStack>
      </>
    ) : null}

    {branches && onBranchChange ? (
      <VStack align="start" gap="1">
        <Muted fontSize="xs">Sucursal</Muted>
        <SelectField
          value={branchId ?? ''}
          onChange={onBranchChange}
          options={branches}
          placeholder="Todas"
          width="filterControl"
        />
      </VStack>
    ) : null}

    {statusOptions && onStatusChange ? (
      <VStack align="start" gap="1">
        <Muted fontSize="xs">Estado</Muted>
        <SelectField
          value={status ?? ''}
          onChange={onStatusChange}
          options={statusOptions}
          placeholder="Todos"
          width="filterControl"
        />
      </VStack>
    ) : null}
  </HStack>
)
