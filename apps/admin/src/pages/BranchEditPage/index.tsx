import { useCallback, useEffect, useRef, useState } from 'react'
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
  InteractiveMap,
  Muted,
  PrimaryButton,
  SecondaryButton,
  Strong,
  SwitchRow,
  ToggleSwitch,
  notifyError,
  notifySuccess,
  type InteractiveMapMarker,
} from '@repo/components'
import { geocodeAddress, useBranches } from '@repo/api'
import { MAP_MARKER_COLORS } from '@repo/theme'
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
  const [locating, setLocating] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)
  const skipInitialAddress = useRef(true)

  useEffect(() => {
    form.reset({
      name: branch?.name ?? '',
      addressText: branch?.addressText ?? '',
      latitude: branch ? String(branch.latitude) : '',
      longitude: branch ? String(branch.longitude) : '',
      phone: branch?.phone ?? '',
    })
    setActive(branch?.active ?? true)
    setLocationError(null)
    skipInitialAddress.current = true
  }, [branch, form])

  const addressText = form.watch('addressText')
  const latitude = form.watch('latitude')
  const longitude = form.watch('longitude')
  const parsedLatitude = Number(latitude)
  const parsedLongitude = Number(longitude)
  const hasCoordinates =
    latitude.trim() !== '' &&
    longitude.trim() !== '' &&
    Number.isFinite(parsedLatitude) &&
    Number.isFinite(parsedLongitude)

  const locate = useCallback(
    async (query: string) => {
      const text = query.trim()
      if (text.length < 5) return
      setLocating(true)
      setLocationError(null)
      try {
        const coords = await geocodeAddress(text)
        if (!coords) {
          setLocationError('No pudimos ubicar esa dirección. Ingresá las coordenadas a mano.')
          return
        }
        form.setValue('latitude', String(coords.lat), { shouldValidate: true, shouldDirty: true })
        form.setValue('longitude', String(coords.lon), { shouldValidate: true, shouldDirty: true })
      } catch {
        setLocationError('No pudimos ubicar esa dirección. Ingresá las coordenadas a mano.')
      } finally {
        setLocating(false)
      }
    },
    [form],
  )

  useEffect(() => {
    if (skipInitialAddress.current) {
      skipInitialAddress.current = false
      return
    }
    const query = addressText?.trim() ?? ''
    if (query.length < 5) return
    const timeout = setTimeout(() => {
      void locate(query)
    }, 600)
    return () => clearTimeout(timeout)
  }, [addressText, locate])

  const mapCenter = { latitude: parsedLatitude, longitude: parsedLongitude }
  const mapMarkers: InteractiveMapMarker[] = hasCoordinates
    ? [
        {
          latitude: parsedLatitude,
          longitude: parsedLongitude,
          color: MAP_MARKER_COLORS.branch,
          label: 'S',
        },
      ]
    : []

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
          <Box>
            <FormField
              name="addressText"
              label="Dirección"
              required
              placeholder="Ej: Av. Vergara 1200, Hurlingham"
            />
            <HStack marginTop="2" gap="3" align="center" wrap="wrap">
              <SecondaryButton
                type="button"
                size="sm"
                loading={locating}
                onClick={() => void locate(form.getValues('addressText') ?? '')}
              >
                Ubicar en el mapa
              </SecondaryButton>
              <Muted fontSize="sm">
                Calculamos latitud y longitud automáticamente desde la dirección.
              </Muted>
            </HStack>
            {locationError ? (
              <Text color="danger" fontSize="sm" marginTop="2">
                {locationError}
              </Text>
            ) : null}
          </Box>
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
          {hasCoordinates ? (
            <InteractiveMap
              center={mapCenter}
              markers={mapMarkers}
              zoom={15}
              height="220px"
              alt="Ubicación de la sucursal"
            />
          ) : null}
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
            cancelDisabled={isSubmitting}
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

  useEffect(() => {
    setHours(branch.hours.length > 0 ? branch.hours : DEFAULT_HOURS)
  }, [branch.id, branch.hours])

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

  const invalidDay = hours.find(
    (hour) => !hour.closed && (!hour.opening || !hour.closing || hour.opening >= hour.closing),
  )
  const saveDisabled = invalidDay != null || isSubmitting

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
          const invalid =
            !hour.closed && (!hour.opening || !hour.closing || hour.opening >= hour.closing)
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
                value={hour.opening ?? ''}
                disabled={hour.closed}
                onChange={(event) => handleTimeChange(day.value, 'opening', event.target.value)}
                aria-label={`Apertura ${day.label}`}
                aria-invalid={invalid}
              />
              <Input
                type="time"
                size="sm"
                borderRadius="lg"
                width="130px"
                value={hour.closing ?? ''}
                disabled={hour.closed}
                onChange={(event) => handleTimeChange(day.value, 'closing', event.target.value)}
                aria-label={`Cierre ${day.label}`}
                aria-invalid={invalid}
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
      {invalidDay ? (
        <Text color="danger" fontSize="sm">
          Revisá los horarios: la apertura debe ser anterior al cierre y ambos campos son
          obligatorios en los días abiertos.
        </Text>
      ) : null}
      <HStack justify="end">
        <PrimaryButton
          size="md"
          loading={isSubmitting}
          disabled={saveDisabled}
          onClick={() => onSave(hours)}
        >
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
    try {
      if (isNew) {
        const createdId = await create(input)
        if (createdId != null) {
          notifySuccess({ title: 'Sucursal creada' })
          navigate(branchEditPath(createdId))
        }
      } else if (id != null) {
        await update(id, input)
        notifySuccess({ title: 'Sucursal actualizada' })
      }
    } catch {
      notifyError({ title: 'No pudimos guardar la sucursal' })
    }
  }

  const handleSaveHours = async (hours: BranchHoursInput[]) => {
    if (!branch) return
    try {
      await saveHours(branch.id, hours)
      notifySuccess({ title: 'Horarios actualizados' })
    } catch {
      notifyError({ title: 'No pudimos guardar los horarios' })
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
                  <HoursForm branch={branch} isSubmitting={isMutating} onSave={handleSaveHours} />
                </>
              ),
            },
          ]}
        />
      ) : null}
    </EditPageShell>
  )
}
