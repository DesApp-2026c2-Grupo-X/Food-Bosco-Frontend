import { useState } from 'react'
import { Box, HStack, Input, Text, VStack } from '@chakra-ui/react'
import { useNavigate, useParams } from 'react-router-dom'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  EditPageShell,
  EditPageTabs,
  FormActions,
  FormField,
  FormLayout,
  Muted,
  PrimaryButton,
  Strong,
  SwitchRow,
  ToggleSwitch,
} from '@repo/components'
import { useBranches } from '@repo/api'
import {
  branchSchema,
  DEFAULT_HOURS,
  WEEK_DAYS,
  type AdminBranch,
  type BranchForm,
  type BranchHoursInput,
  type BranchInput,
} from '@repo/domain'
import { branchEditPath, routes } from '../../routes'

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
          <SwitchRow
            label="Activa"
            checked={active}
            onChange={setActive}
            ariaLabel="Sucursal activa"
          />
          <FormActions
            onCancel={onCancel}
            submitLabel="Guardar"
            isSubmitting={isSubmitting}
            disabled={!form.formState.isValid}
          />
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

  const handleTimeChange = (dayOfWeek: number, field: 'opening' | 'closing', value: string) => {
    if (value === '' || /^\d{2}:\d{2}$/.test(value)) {
      update(dayOfWeek, { [field]: value })
    }
  }

  return (
    <FormLayout>
      <VStack align="stretch" gap="2">
        {WEEK_DAYS.map((day) => {
          const hour = hours.find((h) => h.dayOfWeek === day.value) ?? {
            dayOfWeek: day.value,
            opening: '',
            closing: '',
            closed: false,
          }
          return (
            <HStack key={day.value} gap="3" align="center">
              <Text fontSize="sm" width="90px" fontWeight="medium">
                {day.label}
              </Text>
              <Input
                type="time"
                size="sm"
                borderRadius="lg"
                width="130px"
                defaultValue={hour.opening ?? ''}
                disabled={hour.closed}
                onChange={(event) => handleTimeChange(day.value, 'opening', event.target.value)}
                aria-label={`Apertura ${day.label}`}
              />
              <Input
                type="time"
                size="sm"
                borderRadius="lg"
                width="130px"
                defaultValue={hour.closing ?? ''}
                disabled={hour.closed}
                onChange={(event) => handleTimeChange(day.value, 'closing', event.target.value)}
                aria-label={`Cierre ${day.label}`}
              />
              <HStack gap="2">
                <Text fontSize="sm" color="fg.muted">
                  Cerrado
                </Text>
                <ToggleSwitch
                  checked={hour.closed}
                  onChange={(checked) => update(day.value, { closed: checked })}
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
  const id = branchId
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

  return (
    <EditPageShell
      isNew={isNew}
      isLoading={isLoading}
      hasEntity={branch != null}
      title={isNew ? 'Nueva sucursal' : (branch?.name ?? 'Sucursal')}
      loadingTitle="Sucursal"
      notFound={{
        title: 'Sucursal no encontrada',
        description: 'La sucursal que buscás no existe.',
      }}
    >
      {isNew ? (
        <InfoForm
          branch={null}
          isSubmitting={isMutating}
          onSubmit={handleSave}
          onCancel={() => navigate(routes.branches)}
        />
      ) : branch ? (
        <EditPageTabs
          defaultValue="info"
          tabs={[
            {
              value: 'info',
              label: 'Información',
              content: (
                <InfoForm
                  branch={branch}
                  isSubmitting={isMutating}
                  onSubmit={handleSave}
                  onCancel={() => navigate(routes.branches)}
                />
              ),
            },
            {
              value: 'hours',
              label: 'Horarios',
              content: (
                <>
                  <VStack align="start" gap="1" marginBottom="4">
                    <Strong fontSize="lg">Horarios de atención</Strong>
                    <Muted>Definí apertura y cierre por día.</Muted>
                  </VStack>
                  <HoursForm
                    branch={branch}
                    isSubmitting={isMutating}
                    onSave={(hours) => saveHours(branch.id, hours)}
                  />
                </>
              ),
            },
          ]}
        />
      ) : null}
    </EditPageShell>
  )
}
