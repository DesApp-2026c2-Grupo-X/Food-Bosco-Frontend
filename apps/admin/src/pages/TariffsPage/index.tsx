import { useEffect, useState } from 'react'
import { Badge, HStack, Heading, SimpleGrid, Text, VStack } from '@chakra-ui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { FormProvider, useForm } from 'react-hook-form'
import {
  Card,
  DataTable,
  type DataTableColumn,
  FormField,
  GhostButton,
  Muted,
  PageHeader,
  Price,
  PrimaryButton,
  ResponsiveModal,
  SectionTitle,
  Strong,
  WidePageContainer,
  notifyError,
  notifySuccess,
} from '@repo/components'
import { getApiErrorMessage, useDeliveryTariff } from '@repo/api'
import {
  deliveryTariffFormToInput,
  deliveryTariffSchema,
  type DeliveryTariff,
  type DeliveryTariffForm,
} from '@repo/domain'

const formatAmount = (value: number, currency: string): string =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency }).format(value)

const formatDate = (value: string): string => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date)
}

export const TariffsPage = () => {
  const { data, history, loading, error, isPublishing, publish, retry } = useDeliveryTariff()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingValues, setPendingValues] = useState<DeliveryTariffForm | null>(null)
  const [publishError, setPublishError] = useState<string | null>(null)

  const form = useForm<DeliveryTariffForm>({
    resolver: zodResolver(deliveryTariffSchema),
    defaultValues: {
      baseFare: '',
      perKm: '',
      perOrder: '',
    },
    mode: 'onTouched',
    reValidateMode: 'onChange',
  })

  useEffect(() => {
    if (!data) return

    form.reset({
      baseFare: String(data.baseFare),
      perKm: String(data.perKm),
      perOrder: String(data.perOrder),
    })
  }, [data, form])

  const columns: DataTableColumn<DeliveryTariff>[] = [
    {
      key: 'status',
      header: 'Estado',
      render: (tariff) =>
        tariff.active ? (
          <Badge colorPalette="brand" size="sm">
            Vigente
          </Badge>
        ) : (
          <Muted fontSize="xs">Histórica</Muted>
        ),
    },
    {
      key: 'amounts',
      header: 'Tarifa',
      render: (tariff) => (
        <VStack align="start" gap="0.5">
          <Strong>{formatAmount(tariff.baseFare, tariff.currency)} base</Strong>
          <Muted fontSize="xs">
            {formatAmount(tariff.perKm, tariff.currency)} por km ·{' '}
            {formatAmount(tariff.perOrder, tariff.currency)} por pedido
          </Muted>
        </VStack>
      ),
    },
    {
      key: 'effectiveFrom',
      header: 'Vigente desde',
      hideBelow: 'sm',
      render: (tariff) => <Muted fontSize="sm">{formatDate(tariff.effectiveFrom)}</Muted>,
    },
    {
      key: 'createdBy',
      header: 'Autor',
      hideBelow: 'md',
      render: (tariff) => <Muted fontSize="sm">{tariff.createdBy}</Muted>,
    },
  ]

  const openConfirmation = (values: DeliveryTariffForm) => {
    setPendingValues(values)
    setPublishError(null)
    setConfirmOpen(true)
  }

  const handlePublish = async () => {
    if (!pendingValues) return

    try {
      await publish(deliveryTariffFormToInput(pendingValues))
      notifySuccess({ title: 'Tarifa publicada exitosamente' })
      setConfirmOpen(false)
      setPendingValues(null)
    } catch (publishFailure) {
      const message = getApiErrorMessage(publishFailure)
      setPublishError(message)
      notifyError({ title: 'No se pudo publicar la tarifa', description: message })
    }
  }

  if (loading && !data) {
    return (
      <WidePageContainer>
        <PageHeader
          title="Tarifas de delivery"
          description="Definí cómo se calcula el pago de cada viaje."
        />
        <Card>
          <Muted>Cargando la tarifa vigente…</Muted>
        </Card>
      </WidePageContainer>
    )
  }

  if (error && !data) {
    return (
      <WidePageContainer>
        <PageHeader
          title="Tarifas de delivery"
          description="Definí cómo se calcula el pago de cada viaje."
        />
        <Card>
          <VStack align="start" gap="4">
            <Heading size="md">No pudimos cargar las tarifas</Heading>
            <Muted>{getApiErrorMessage(error)}</Muted>
            <GhostButton onClick={() => void retry()}>Reintentar</GhostButton>
          </VStack>
        </Card>
      </WidePageContainer>
    )
  }

  return (
    <WidePageContainer>
      <PageHeader
        title="Tarifas de delivery"
        description="Definí cómo se calcula el pago de cada viaje."
      />

      <SimpleGrid columns={{ base: 1, xl: 2 }} gap="6" alignItems="start">
        <Card>
          <VStack align="start" gap="2">
            <HStack justify="space-between" width="full">
              <SectionTitle>Tarifa vigente</SectionTitle>
              {data ? (
                <Badge colorPalette="brand" size="sm">
                  {data.currency}
                </Badge>
              ) : null}
            </HStack>
            {data ? (
              <>
                <HStack align="baseline" gap="2" wrap="wrap">
                  <Price fontSize="2xl">{formatAmount(data.baseFare, data.currency)}</Price>
                  <Muted>tarifa base</Muted>
                </HStack>
                <SimpleGrid columns={{ base: 1, sm: 2 }} gap="4" width="full">
                  <VStack align="start" gap="0.5">
                    <Muted fontSize="xs">Por kilómetro</Muted>
                    <Strong>{formatAmount(data.perKm, data.currency)}</Strong>
                  </VStack>
                  <VStack align="start" gap="0.5">
                    <Muted fontSize="xs">Por pedido</Muted>
                    <Strong>{formatAmount(data.perOrder, data.currency)}</Strong>
                  </VStack>
                </SimpleGrid>
                <Muted fontSize="sm">Vigente desde {formatDate(data.effectiveFrom)}</Muted>
              </>
            ) : (
              <Muted>No hay una tarifa vigente.</Muted>
            )}
          </VStack>
        </Card>

        <Card>
          <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(openConfirmation)}>
              <VStack align="stretch" gap="4">
                <SectionTitle>Publicar nueva versión</SectionTitle>
                <Muted fontSize="sm">
                  La tarifa se aplica a las ofertas nuevas. La moneda es fija en ARS.
                </Muted>
                <SimpleGrid columns={{ base: 1, sm: 3 }} gap="4">
                  <FormField
                    name="baseFare"
                    label="Tarifa base"
                    required
                    inputMode="decimal"
                    placeholder="500"
                  />
                  <FormField
                    name="perKm"
                    label="Por km"
                    required
                    inputMode="decimal"
                    placeholder="200"
                  />
                  <FormField
                    name="perOrder"
                    label="Por pedido"
                    required
                    inputMode="decimal"
                    placeholder="300"
                  />
                </SimpleGrid>
                <HStack justify="space-between" wrap="wrap" gap="3">
                  <Muted fontSize="sm">Moneda: ARS</Muted>
                  <PrimaryButton
                    type="submit"
                    size="md"
                    disabled={!form.formState.isValid || isPublishing}
                  >
                    Publicar tarifa
                  </PrimaryButton>
                </HStack>
              </VStack>
            </form>
          </FormProvider>
        </Card>
      </SimpleGrid>

      <VStack align="stretch" gap="4">
        <SectionTitle>Historial</SectionTitle>
        <DataTable
          columns={columns}
          rows={history}
          getRowKey={(tariff) => tariff.id}
          isLoading={loading}
          emptyTitle="Sin tarifas"
          emptyDescription="Todavía no se publicó ninguna tarifa."
        />
      </VStack>

      <ResponsiveModal
        open={confirmOpen}
        onClose={() => {
          if (isPublishing) return
          setConfirmOpen(false)
          setPublishError(null)
        }}
        closable={!isPublishing}
      >
        <VStack align="stretch" gap="4">
          <Heading size="md">Confirmar publicación</Heading>
          <Text fontSize="sm" color="fg.muted">
            La tarifa anterior dejará de aplicarse a las ofertas nuevas. Los viajes ya ofertados
            conservan la tarifa con la que se ofertaron.
          </Text>
          {pendingValues ? (
            <VStack align="start" gap="1" fontSize="sm">
              <Strong>
                Base {formatAmount(Number(pendingValues.baseFare), 'ARS')} ·{' '}
                {formatAmount(Number(pendingValues.perKm), 'ARS')} por km ·{' '}
                {formatAmount(Number(pendingValues.perOrder), 'ARS')} por pedido
              </Strong>
            </VStack>
          ) : null}
          {publishError ? (
            <Text fontSize="sm" color="danger">
              {publishError}
            </Text>
          ) : null}
          <HStack justify="end" gap="2">
            <GhostButton
              onClick={() => {
                setConfirmOpen(false)
                setPublishError(null)
              }}
              disabled={isPublishing}
            >
              Cancelar
            </GhostButton>
            <PrimaryButton size="md" onClick={() => void handlePublish()} loading={isPublishing}>
              Confirmar publicación
            </PrimaryButton>
          </HStack>
        </VStack>
      </ResponsiveModal>
    </WidePageContainer>
  )
}
