import { useMemo, useState } from 'react'
import { Box, Flex, HStack, Text, VStack } from '@chakra-ui/react'
import { useNavigate, useParams } from 'react-router-dom'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Chip,
  EditPageShell,
  EditPageTabs,
  FormActions,
  FormField,
  FormLayout,
  FormSelectField,
  FormTextAreaField,
  Muted,
  Strong,
  SwitchRow,
  notifyError,
  notifySuccess,
} from '@repo/components'
import {
  getApiErrorMessage,
  useAdminCategories,
  useAdminProducts,
  useAdminPromotions,
  useBranches,
} from '@repo/api'
import {
  DAYS_OF_WEEK_LABELS,
  promotionSchema,
  type AdminBranch,
  type Category,
  type Promotion,
  type PromotionForm,
  type PromotionInput,
  type PromotionScope,
  type PromotionType,
} from '@repo/domain'
import type { AdminProductRow } from '@repo/api'
import { routes } from '../../routes'

const PROMOTION_TYPE_OPTIONS = [
  { value: 'PERCENTAGE', label: 'Porcentaje (%)' },
  { value: 'FIXED_AMOUNT', label: 'Monto fijo ($)' },
  { value: 'BUY_X_GET_Y', label: 'NxM (Lleva X, Paga Y)' },
]

const PROMOTION_SCOPE_OPTIONS = [
  { value: 'ORDER', label: 'Todo el pedido' },
  { value: 'CATEGORY', label: 'Categorías específicas' },
  { value: 'PRODUCT', label: 'Productos específicos' },
]

const DAYS_OF_WEEK = [0, 1, 2, 3, 4, 5, 6]

interface PromotionFormViewProps {
  initialPromotion: Promotion | null
  isMutating: boolean
  categories: Category[]
  products: AdminProductRow[]
  branches: AdminBranch[]
  onSubmit: (input: PromotionInput) => Promise<void>
  onCancel: () => void
}

const PromotionFormView = ({
  initialPromotion,
  isMutating,
  categories,
  products,
  branches,
  onSubmit,
  onCancel,
}: PromotionFormViewProps) => {
  const defaultDates = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10)
    const nextMonth = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10)
    return { today, nextMonth }
  }, [])

  const [active, setActive] = useState(initialPromotion?.active ?? true)
  const [stackable, setStackable] = useState(initialPromotion?.stackable ?? false)
  const [selectedDays, setSelectedDays] = useState<number[]>(initialPromotion?.daysOfWeek ?? [])
  const [selectedBranches, setSelectedBranches] = useState<string[]>(
    initialPromotion?.branchIds ?? [],
  )
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialPromotion?.categoryIds ?? [],
  )
  const [selectedProducts, setSelectedProducts] = useState<string[]>(
    initialPromotion?.productIds ?? [],
  )

  const form = useForm<PromotionForm>({
    resolver: zodResolver(promotionSchema as never),
    defaultValues: {
      name: initialPromotion?.name ?? '',
      description: initialPromotion?.description ?? '',
      startDate: initialPromotion?.startDate
        ? initialPromotion.startDate.slice(0, 10)
        : defaultDates.today,
      endDate: initialPromotion?.endDate
        ? initialPromotion.endDate.slice(0, 10)
        : defaultDates.nextMonth,
      type: initialPromotion?.type ?? 'PERCENTAGE',
      discountValue: (initialPromotion?.discountValue ?? '') as unknown as number,
      maxDiscount: (initialPromotion?.maxDiscount ?? '') as unknown as number,
      buyQuantity: (initialPromotion?.buyQuantity ?? '') as unknown as number,
      payQuantity: (initialPromotion?.payQuantity ?? '') as unknown as number,
      scope: initialPromotion?.scope ?? 'ORDER',
      categoryIds: initialPromotion?.categoryIds ?? [],
      productIds: initialPromotion?.productIds ?? [],
      branchIds: initialPromotion?.branchIds ?? [],
      minSubtotal: initialPromotion?.minSubtotal ?? 0,
      minQuantity: initialPromotion?.minQuantity ?? 0,
      daysOfWeek: initialPromotion?.daysOfWeek ?? [],
      startTime: initialPromotion?.startTime ?? '',
      endTime: initialPromotion?.endTime ?? '',
      code: initialPromotion?.code ?? '',
      stackable: initialPromotion?.stackable ?? false,
      priority: initialPromotion?.priority ?? 0,
      maxUsesTotal: (initialPromotion?.maxUsesTotal ?? '') as unknown as number,
      maxUsesPerCustomer: (initialPromotion?.maxUsesPerCustomer ?? '') as unknown as number,
    },
    mode: 'onTouched',
    reValidateMode: 'onChange',
  })

  const promoType = form.watch('type')
  const promoScope = form.watch('scope')

  const toggleDay = (day: number) => {
    setSelectedDays((prev) => {
      const next = prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
      form.setValue('daysOfWeek', next, { shouldValidate: true, shouldDirty: true })
      return next
    })
  }

  const toggleBranch = (branchId: string) => {
    setSelectedBranches((prev) => {
      const next = prev.includes(branchId)
        ? prev.filter((id) => id !== branchId)
        : [...prev, branchId]
      form.setValue('branchIds', next, { shouldValidate: true, shouldDirty: true })
      return next
    })
  }

  const toggleCategory = (catId: string) => {
    setSelectedCategories((prev) => {
      const next = prev.includes(catId) ? prev.filter((id) => id !== catId) : [...prev, catId]
      form.setValue('categoryIds', next, { shouldValidate: true, shouldDirty: true })
      return next
    })
  }

  const toggleProduct = (prodId: string) => {
    setSelectedProducts((prev) => {
      const next = prev.includes(prodId) ? prev.filter((id) => id !== prodId) : [...prev, prodId]
      form.setValue('productIds', next, { shouldValidate: true, shouldDirty: true })
      return next
    })
  }

  const handleSubmit = form.handleSubmit(async (values) => {
    const input: PromotionInput = {
      name: values.name.trim(),
      description: values.description?.trim() || null,
      active,
      startDate: new Date(`${values.startDate}T00:00:00.000Z`).toISOString(),
      endDate: new Date(`${values.endDate}T23:59:59.999Z`).toISOString(),
      type: values.type as PromotionType,
      discountValue:
        values.type === 'BUY_X_GET_Y'
          ? null
          : values.discountValue != null
            ? Number(values.discountValue)
            : null,
      maxDiscount:
        values.type === 'PERCENTAGE' && values.maxDiscount != null
          ? Number(values.maxDiscount)
          : null,
      buyQuantity:
        values.type === 'BUY_X_GET_Y' && values.buyQuantity != null
          ? Number(values.buyQuantity)
          : null,
      payQuantity:
        values.type === 'BUY_X_GET_Y' && values.payQuantity != null
          ? Number(values.payQuantity)
          : null,
      scope: values.scope as PromotionScope,
      categoryIds: values.scope === 'CATEGORY' ? selectedCategories : [],
      productIds: values.scope === 'PRODUCT' ? selectedProducts : [],
      branchIds: selectedBranches,
      daysOfWeek: selectedDays,
      startTime: values.startTime?.trim() || null,
      endTime: values.endTime?.trim() || null,
      minSubtotal: values.minSubtotal ? Number(values.minSubtotal) : 0,
      minQuantity: values.minQuantity ? Number(values.minQuantity) : 0,
      code: values.code ? values.code.trim().toUpperCase() : null,
      stackable,
      priority: values.priority ? Number(values.priority) : 0,
      maxUsesTotal: values.maxUsesTotal ? Number(values.maxUsesTotal) : null,
      maxUsesPerCustomer: values.maxUsesPerCustomer ? Number(values.maxUsesPerCustomer) : null,
    }
    await onSubmit(input)
  })

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit}>
        <EditPageTabs
          defaultValue="general"
          tabs={[
            {
              value: 'general',
              label: 'General',
              content: (
                <FormLayout>
                  <FormField
                    name="name"
                    label="Nombre"
                    required
                    placeholder="Ej: 2x1 en Hamburguesas o 20% OFF"
                  />
                  <FormTextAreaField
                    name="description"
                    label="Descripción"
                    placeholder="Detalle o condiciones visibles para el cliente"
                  />
                  <SwitchRow
                    label="Promoción activa"
                    checked={active}
                    onChange={setActive}
                    ariaLabel="Promoción activa"
                  />
                  <HStack gap="4" width="full">
                    <FormField
                      name="startDate"
                      label="Fecha de inicio"
                      type="date"
                      required
                      placeholder="YYYY-MM-DD"
                    />
                    <FormField
                      name="endDate"
                      label="Fecha de fin"
                      type="date"
                      required
                      placeholder="YYYY-MM-DD"
                    />
                  </HStack>
                </FormLayout>
              ),
            },
            {
              value: 'benefit',
              label: 'Beneficio',
              content: (
                <FormLayout>
                  <FormSelectField
                    name="type"
                    label="Tipo de promoción"
                    required
                    options={PROMOTION_TYPE_OPTIONS}
                  />

                  {promoType === 'PERCENTAGE' ? (
                    <>
                      <FormField
                        name="discountValue"
                        label="Porcentaje de descuento (%)"
                        required
                        type="number"
                        placeholder="Ej: 20"
                      />
                      <FormField
                        name="maxDiscount"
                        label="Tope de descuento en pesos (opcional)"
                        type="number"
                        placeholder="Ej: 3000 (dejar vacío si no tiene tope)"
                      />
                    </>
                  ) : null}

                  {promoType === 'FIXED_AMOUNT' ? (
                    <FormField
                      name="discountValue"
                      label="Monto de descuento en pesos ($)"
                      required
                      type="number"
                      placeholder="Ej: 1500"
                    />
                  ) : null}

                  {promoType === 'BUY_X_GET_Y' ? (
                    <HStack gap="4" width="full">
                      <FormField
                        name="buyQuantity"
                        label="Lleva cantidad (X)"
                        required
                        type="number"
                        placeholder="Ej: 2 (para 2x1) o 3 (para 3x2)"
                      />
                      <FormField
                        name="payQuantity"
                        label="Paga cantidad (Y)"
                        required
                        type="number"
                        placeholder="Ej: 1 (para 2x1) o 2 (para 3x2)"
                      />
                    </HStack>
                  ) : null}
                </FormLayout>
              ),
            },
            {
              value: 'scope',
              label: 'Alcance',
              content: (
                <FormLayout>
                  <FormSelectField
                    name="scope"
                    label="Alcance del beneficio"
                    required
                    options={PROMOTION_SCOPE_OPTIONS}
                  />

                  {promoScope === 'CATEGORY' ? (
                    <VStack align="start" gap="2" width="full">
                      <Strong fontSize="sm">Categorías incluidas (al menos una):</Strong>
                      <Flex wrap="wrap" gap="2">
                        {categories.map((cat) => (
                          <Chip
                            key={cat.id}
                            label={cat.name}
                            active={selectedCategories.includes(cat.id)}
                            onClick={() => toggleCategory(cat.id)}
                          />
                        ))}
                      </Flex>
                      {form.formState.errors.categoryIds ? (
                        <Text color="red.500" fontSize="xs">
                          {form.formState.errors.categoryIds.message}
                        </Text>
                      ) : null}
                    </VStack>
                  ) : null}

                  {promoScope === 'PRODUCT' ? (
                    <VStack align="start" gap="2" width="full">
                      <Strong fontSize="sm">Productos incluidos (al menos uno):</Strong>
                      <Flex wrap="wrap" gap="2" maxHeight="240px" overflowY="auto">
                        {products.map((row) => {
                          const prodId = String(row.product.id)
                          return (
                            <Chip
                              key={prodId}
                              label={row.product.name}
                              active={selectedProducts.includes(prodId)}
                              onClick={() => toggleProduct(prodId)}
                            />
                          )
                        })}
                      </Flex>
                      {form.formState.errors.productIds ? (
                        <Text color="red.500" fontSize="xs">
                          {form.formState.errors.productIds.message}
                        </Text>
                      ) : null}
                    </VStack>
                  ) : null}

                  <VStack align="start" gap="2" width="full">
                    <Strong fontSize="sm">Sucursales aplicables:</Strong>
                    <Muted fontSize="xs">
                      Si no seleccionás ninguna, la promoción aplica a todas las sucursales.
                    </Muted>
                    <Flex wrap="wrap" gap="2">
                      {branches.map((b) => (
                        <Chip
                          key={b.id}
                          label={b.name}
                          active={selectedBranches.includes(b.id)}
                          onClick={() => toggleBranch(b.id)}
                        />
                      ))}
                    </Flex>
                  </VStack>
                </FormLayout>
              ),
            },
            {
              value: 'conditions',
              label: 'Condiciones',
              content: (
                <FormLayout>
                  <VStack align="start" gap="2" width="full">
                    <Strong fontSize="sm">Días de vigencia:</Strong>
                    <Muted fontSize="xs">
                      Si no seleccionás ninguno, aplica todos los días de la semana.
                    </Muted>
                    <Flex wrap="wrap" gap="2">
                      {DAYS_OF_WEEK.map((day) => (
                        <Chip
                          key={day}
                          label={DAYS_OF_WEEK_LABELS[day] ?? String(day)}
                          active={selectedDays.includes(day)}
                          onClick={() => toggleDay(day)}
                        />
                      ))}
                    </Flex>
                  </VStack>

                  <HStack gap="4" width="full">
                    <FormField
                      name="startTime"
                      label="Hora inicio (opcional)"
                      type="time"
                      placeholder="HH:mm"
                    />
                    <FormField
                      name="endTime"
                      label="Hora fin (opcional)"
                      type="time"
                      placeholder="HH:mm"
                    />
                  </HStack>

                  <HStack gap="4" width="full">
                    <FormField
                      name="minSubtotal"
                      label="Mínimo de compra ($)"
                      type="number"
                      placeholder="0"
                    />
                    <FormField
                      name="minQuantity"
                      label="Cantidad mínima de unidades"
                      type="number"
                      placeholder="0"
                    />
                  </HStack>
                </FormLayout>
              ),
            },
            {
              value: 'limits',
              label: 'Cupón y Límites',
              content: (
                <FormLayout>
                  <FormField
                    name="code"
                    label="Código de cupón (opcional)"
                    placeholder="Ej: BIENVENIDO2026 (dejar vacío para descuento automático)"
                  />
                  <SwitchRow
                    label="Acumulable con otras promociones"
                    checked={stackable}
                    onChange={(checked) => {
                      setStackable(checked)
                      form.setValue('stackable', checked)
                    }}
                    ariaLabel="Promoción acumulable"
                  />
                  <FormField
                    name="priority"
                    label="Prioridad (0 a 100)"
                    type="number"
                    placeholder="0"
                  />
                  <HStack gap="4" width="full">
                    <FormField
                      name="maxUsesTotal"
                      label="Límite total de usos (opcional)"
                      type="number"
                      placeholder="Ilimitado si está vacío"
                    />
                    <FormField
                      name="maxUsesPerCustomer"
                      label="Límite de usos por cliente (opcional)"
                      type="number"
                      placeholder="Ilimitado si está vacío"
                    />
                  </HStack>
                </FormLayout>
              ),
            },
          ]}
        />

        <Box marginTop="6">
          <FormActions
            onCancel={onCancel}
            submitLabel="Guardar promoción"
            isSubmitting={isMutating}
          />
        </Box>
      </form>
    </FormProvider>
  )
}

export const PromotionEditPage = () => {
  const { promotionId } = useParams<{ promotionId?: string }>()
  const isNew = !promotionId
  const navigate = useNavigate()

  const { promotions = [], isLoading, isMutating, create, update } = useAdminPromotions()
  const { categories = [] } = useAdminCategories()
  const { products = [] } = useAdminProducts()
  const { branches = [] } = useBranches()

  const promotion = useMemo(
    () => (promotionId ? (promotions.find((p) => p.id === promotionId) ?? null) : null),
    [promotionId, promotions],
  )

  const handleSubmit = async (input: PromotionInput) => {
    try {
      if (isNew) {
        await create(input)
        notifySuccess({ title: 'Promoción creada exitosamente' })
      } else if (promotionId) {
        await update(promotionId, input)
        notifySuccess({ title: 'Promoción actualizada exitosamente' })
      }
      navigate(routes.promotions)
    } catch (caught) {
      notifyError({
        title: 'Error al guardar la promoción',
        description: getApiErrorMessage(caught),
      })
    }
  }

  return (
    <EditPageShell
      isNew={isNew}
      isLoading={!isNew && isLoading}
      hasEntity={isNew || promotion != null}
      title={isNew ? 'Nueva promoción' : (promotion?.name ?? 'Promoción')}
      loadingTitle="Promoción"
      notFound={{
        title: 'Promoción no encontrada',
        description: 'La promoción que buscás no existe.',
      }}
    >
      {isNew ? (
        <PromotionFormView
          key="new"
          initialPromotion={null}
          isMutating={isMutating}
          categories={categories}
          products={products}
          branches={branches}
          onSubmit={handleSubmit}
          onCancel={() => navigate(routes.promotions)}
        />
      ) : promotion ? (
        <PromotionFormView
          key={promotion.id}
          initialPromotion={promotion}
          isMutating={isMutating}
          categories={categories}
          products={products}
          branches={branches}
          onSubmit={handleSubmit}
          onCancel={() => navigate(routes.promotions)}
        />
      ) : null}
    </EditPageShell>
  )
}
