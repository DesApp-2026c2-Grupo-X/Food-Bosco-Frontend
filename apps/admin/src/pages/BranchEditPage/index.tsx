import { useState } from 'react'
import { Box, HStack, Input, Text, VStack, Tabs } from '@chakra-ui/react'
import { useNavigate, useParams } from 'react-router-dom'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  BackButton,
  EmptyState,
  FormField,
  FormLayout,
  GhostButton,
  Muted,
  PageTitle,
  PrimaryButton,
  Strong,
  ToggleSwitch,
  WidePageContainer,
} from '@repo/components'
import { useBranches } from '@repo/api'
import {
  branchSchema,
  type AdminBranch,
  type BranchForm,
  type BranchHoursInput,
  type BranchInput,
} from '@repo/domain'
import { branchEditPath, routes } from '../../routes'

const WEEK_DAYS = [
  { dayOfWeek: 1, label: 'Lunes' },
  { dayOfWeek: 2, label: 'Martes' },
  { dayOfWeek: 3, label: 'Miércoles' },
  { dayOfWeek: 4, label: 'Jueves' },
  { dayOfWeek: 5, label: 'Viernes' },
  { dayOfWeek: 6, label: 'Sábado' },
  { dayOfWeek: 7, label: 'Domingo' },
]

const DEFAULT_HOURS: BranchHoursInput[] = WEEK_DAYS.map(({ dayOfWeek }) => ({
  dayOfWeek,
  opening: '09:00',
  closing: '23:00',
  closed: false,
}))

interface InfoFormProps {
  branch: AdminBranch | null
  isSubmitting: boolean
  onSubmit: (input: BranchInput) => Promise<void>
  onCancel: () => void
}

const InfoForm = ({ branch, isSubmitting, onSubmit, onCancel }: InfoFormProps) => {
  const form = useForm<BranchForm>({
    resolver: zodResolver(branchSchema),
    defaultValues: {
      name: branch?.name ?? '',
      addressText: branch?.addressText ?? '',
      latitude: branch ? String(branch.latitude) : '',
      longitude: branch ? String(branch.longitude) : '',
      phone: branch?.phone ?? '',
    },
    mode: 'onTouched',
    reValidateMode: 'onChange',
  })
  const [active, setActive] = useState(branch?.active ?? true)

  const handleSubmit = form.handleSubmit(async (values) => {
    const input: BranchInput = {
      name: values.name.trim(),
      addressText: values.addressText.trim(),
      latitude: Number(values.latitude),
      longitude: Number(values.longitude),
      phone: values.phone?.trim() ?? '',
      active,
    }
    await onSubmit(input)
  })

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit}>
        <FormLayout>
          <FormField name="name" label="Nombre" required placeholder="Ej: Centro" />
          <FormField
            name="addressText"
            label="Dirección"
            required
            placeholder="Ej: Av. Vergara 1200, Hurlingham"
          />
          <HStack gap="4" align="start">
            <Box flex="1">
              <FormField
                name="latitude"
                label="Latitud"
                required
                inputMode="decimal"
                placeholder="-34.58"
              />
            </Box>
            <Box flex="1">
              <FormField
                name="longitude"
                label="Longitud"
                required
                inputMode="decimal"
                placeholder="-58.63"
              />
            </Box>
          </HStack>
          <FormField name="phone" label="Teléfono" placeholder="Ej: 11 5555 1111" />
          <HStack justify="space-between">
            <Text fontSize="sm" color="fg.muted">
              Activa
            </Text>
            <ToggleSwitch checked={active} onChange={setActive} ariaLabel="Sucursal activa" />
          </HStack>
          <HStack justify="end" gap="2">
            <GhostButton type="button" onClick={onCancel}>
              Cancelar
            </GhostButton>
            <PrimaryButton
              type="submit"
              size="md"
              disabled={!form.formState.isValid || isSubmitting}
              loading={isSubmitting}
            >
              Guardar
            </PrimaryButton>
          </HStack>
        </FormLayout>
      </form>
    </FormProvider>
  )
}

interface HoursFormProps {
  branch: AdminBranch
  isSubmitting: boolean
  onSave: (hours: BranchHoursInput[]) => Promise<void>
}

const HoursForm = ({ branch, isSubmitting, onSave }: HoursFormProps) => {
  const [hours, setHours] = useState<BranchHoursInput[]>(
    branch.hours.length > 0 ? branch.hours : DEFAULT_HOURS,
  )

  const update = (dayOfWeek: number, patch: Partial<BranchHoursInput>) => {
    setHours((current) =>
      current.map((hour) => (hour.dayOfWeek === dayOfWeek ? { ...hour, ...patch } : hour)),
    )
  }

  return (
    <FormLayout>
      <VStack align="stretch" gap="2">
        {WEEK_DAYS.map((day) => {
          const hour = hours.find((h) => h.dayOfWeek === day.dayOfWeek) ?? {
            dayOfWeek: day.dayOfWeek,
            opening: '',
            closing: '',
            closed: false,
          }
          return (
            <HStack key={day.dayOfWeek} gap="3" align="center">
              <Text fontSize="sm" width="90px" fontWeight="medium">
                {day.label}
              </Text>
              <Input
                type="time"
                size="sm"
                borderRadius="lg"
                width="130px"
                value={hour.opening}
                disabled={hour.closed}
                onChange={(event) => update(day.dayOfWeek, { opening: event.target.value })}
                aria-label={`Apertura ${day.label}`}
              />
              <Input
                type="time"
                size="sm"
                borderRadius="lg"
                width="130px"
                value={hour.closing}
                disabled={hour.closed}
                onChange={(event) => update(day.dayOfWeek, { closing: event.target.value })}
                aria-label={`Cierre ${day.label}`}
              />
              <HStack gap="2">
                <Text fontSize="sm" color="fg.muted">
                  Cerrado
                </Text>
                <ToggleSwitch
                  checked={hour.closed}
                  onChange={(checked) => update(day.dayOfWeek, { closed: checked })}
                  ariaLabel={`Cerrado ${day.label}`}
                />
              </HStack>
            </HStack>
          )
        })}
      </VStack>
      <HStack justify="end">
        <PrimaryButton size="md" loading={isSubmitting} onClick={() => onSave(hours)}>
          Guardar horarios
        </PrimaryButton>
      </HStack>
    </FormLayout>
  )
}

export const BranchEditPage = () => {
  const { branchId } = useParams()
  const id = branchId ? Number(branchId) : undefined
  const isNew = id == null
  const navigate = useNavigate()

  const { branches, isLoading, isMutating, create, update, saveHours } = useBranches()
  const branch = id != null ? branches.find((b) => b.id === id) : undefined

  const handleSave = async (input: BranchInput) => {
    if (isNew) {
      const createdId = await create(input)
      if (createdId != null) navigate(branchEditPath(createdId))
    } else if (id != null) {
      await update(id, input)
    }
  }

  if (!isNew && isLoading) {
    return (
      <WidePageContainer>
        <BackButton />
        <PageTitle>Sucursal</PageTitle>
      </WidePageContainer>
    )
  }

  if (!isNew && !branch) {
    return (
      <WidePageContainer>
        <BackButton />
        <EmptyState
          title="Sucursal no encontrada"
          description="La sucursal que buscás no existe."
        />
      </WidePageContainer>
    )
  }

  return (
    <WidePageContainer>
      <BackButton />
      <Box>
        <PageTitle>{isNew ? 'Nueva sucursal' : (branch?.name ?? 'Sucursal')}</PageTitle>
      </Box>

      {isNew ? (
        <InfoForm
          branch={null}
          isSubmitting={isMutating}
          onSubmit={handleSave}
          onCancel={() => navigate(routes.branches)}
        />
      ) : branch ? (
        <Tabs.Root defaultValue="info">
          <Tabs.List>
            <Tabs.Trigger value="info">Información</Tabs.Trigger>
            <Tabs.Trigger value="hours">Horarios</Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="info">
            <Box marginTop="6">
              <InfoForm
                branch={branch}
                isSubmitting={isMutating}
                onSubmit={handleSave}
                onCancel={() => navigate(routes.branches)}
              />
            </Box>
          </Tabs.Content>

          <Tabs.Content value="hours">
            <Box marginTop="6">
              <VStack align="start" gap="1" marginBottom="4">
                <Strong fontSize="lg">Horarios de atención</Strong>
                <Muted>Definí apertura y cierre por día.</Muted>
              </VStack>
              <HoursForm
                branch={branch}
                isSubmitting={isMutating}
                onSave={(hours) => saveHours(branch.id, hours)}
              />
            </Box>
          </Tabs.Content>
        </Tabs.Root>
      ) : null}
    </WidePageContainer>
  )
}
