import { useMemo, useState } from 'react'
import { HStack, VStack } from '@chakra-ui/react'
import ListUl from '@gravity-ui/icons/ListUl'
import Layers from '@gravity-ui/icons/Layers'
import { useNavigate, useParams } from 'react-router-dom'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Card,
  ConfirmDeleteModal,
  EditPageShell,
  EditPageTabs,
  EmptyState,
  FormActions,
  FormField,
  FormImageField,
  FormLayout,
  FormSelectField,
  FormTextAreaField,
  GhostButton,
  Muted,
  PrimaryButton,
  Strong,
  SwitchRow,
} from '@repo/components'
import { useAdminCategories, useImageUpload, useIngredients, useProductEditor } from '@repo/api'
import {
  formatPrice,
  optionsFromEntities,
  productSchema,
  type ConfigGroupInput,
  type ConfigOptionInput,
  type Ingredient,
  type Product,
  type ProductConfigGroup,
  type ProductForm,
  type ProductInput,
  type ProductOption,
  type RecipeItem,
  type RecipeItemInput,
} from '@repo/domain'
import { ConfigGroupFormModal } from '../../components/ConfigGroupFormModal'
import { ConfigOptionFormModal } from '../../components/ConfigOptionFormModal'
import { RecipeItemFormModal } from '../../components/RecipeItemFormModal'
import { productEditPath, routes } from '../../routes'

interface DataFormProps {
  categories: { value: string; label: string }[]
  product: Product | null
  isSubmitting: boolean
  onUploadImage: (file: File) => Promise<string>
  isUploadingImage: boolean
  onSubmit: (input: ProductInput) => Promise<void>
  onCancel: () => void
}

const DataForm = ({
  categories,
  product,
  isSubmitting,
  onUploadImage,
  isUploadingImage,
  onSubmit,
  onCancel,
}: DataFormProps) => {
  const form = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name ?? '',
      description: product?.description ?? '',
      categoryId: product ? String(product.categoryId) : '',
      price: product ? String(product.price) : '',
      image: product?.image ?? '',
    },
    mode: 'onTouched',
    reValidateMode: 'onChange',
  })
  const [available, setAvailable] = useState(product?.available ?? true)

  const handleSubmit = form.handleSubmit(async (values) => {
    const input: ProductInput = {
      name: values.name.trim(),
      description: values.description.trim(),
      categoryId: values.categoryId,
      price: Number(values.price),
      image: values.image?.trim() || null,
      available,
    }
    await onSubmit(input)
  })

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit}>
        <FormLayout>
          <FormField name="name" label="Nombre" required placeholder="Ej: Hamburguesa Clásica" />
          <FormTextAreaField
            name="description"
            label="Descripción"
            required
            placeholder="Descripción del producto"
          />
          <FormSelectField
            name="categoryId"
            label="Categoría"
            required
            options={categories}
            placeholder="Seleccionar categoría..."
          />
          <FormField name="price" label="Precio" required inputMode="decimal" placeholder="0" />
          <FormImageField
            name="image"
            label="Imagen"
            onUpload={onUploadImage}
            isUploading={isUploadingImage}
          />
          <SwitchRow
            label="Disponible"
            checked={available}
            onChange={setAvailable}
            ariaLabel="Producto disponible"
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

interface ConfigsSectionProps {
  product: Product
  isMutating: boolean
  addGroup: (input: ConfigGroupInput) => Promise<void>
  updateGroup: (groupId: string, input: ConfigGroupInput) => Promise<void>
  removeGroup: (groupId: string) => Promise<void>
  addOption: (groupId: string, input: ConfigOptionInput) => Promise<void>
  updateOption: (groupId: string, optionId: string, input: ConfigOptionInput) => Promise<void>
  removeOption: (groupId: string, optionId: string) => Promise<void>
}

const ConfigsSection = ({
  product,
  isMutating,
  addGroup,
  updateGroup,
  removeGroup,
  addOption,
  updateOption,
  removeOption,
}: ConfigsSectionProps) => {
  const [groupModal, setGroupModal] = useState<ProductConfigGroup | null | undefined>(undefined)
  const [optionModal, setOptionModal] = useState<{
    group: ProductConfigGroup
    option: ProductOption | null
  } | null>(null)
  const [confirmGroup, setConfirmGroup] = useState<ProductConfigGroup | null>(null)

  const groups = product.configGroups

  return (
    <VStack align="stretch" gap="4">
      <HStack justify="space-between">
        <Strong fontSize="lg">Configuraciones</Strong>
        <PrimaryButton size="md" onClick={() => setGroupModal(null)}>
          Nuevo grupo
        </PrimaryButton>
      </HStack>

      {groups.length === 0 ? (
        <EmptyState
          icon={<ListUl width={40} height={40} />}
          title="Sin configuraciones"
          description="Agregá grupos como tamaño, sabores o adicionales."
        />
      ) : (
        groups.map((group) => (
          <Card key={group.id}>
            <VStack align="stretch" gap="3">
              <HStack justify="space-between" gap="4">
                <VStack align="start" gap="0.5">
                  <Strong>{group.name}</Strong>
                  <Muted fontSize="sm">
                    {group.type === 'single' ? 'Selección única' : 'Selección múltiple'} ·{' '}
                    {group.required ? 'Obligatorio' : 'Opcional'} · min {group.min} / max{' '}
                    {group.max}
                  </Muted>
                </VStack>
                <HStack gap="1">
                  <GhostButton size="sm" onClick={() => setGroupModal(group)}>
                    Editar
                  </GhostButton>
                  <GhostButton size="sm" color="danger" onClick={() => setConfirmGroup(group)}>
                    Eliminar
                  </GhostButton>
                </HStack>
              </HStack>

              <VStack align="stretch" gap="1">
                {group.options.map((option) => (
                  <HStack
                    key={option.id}
                    justify="space-between"
                    gap="3"
                    bg="bg.muted"
                    borderRadius="xl"
                    paddingX="3"
                    paddingY="2"
                  >
                    <HStack gap="2">
                      <Strong fontSize="sm">{option.name}</Strong>
                      <Muted fontSize="sm">
                        {option.extraPrice > 0
                          ? `+ ${formatPrice(option.extraPrice)}`
                          : 'Sin cargo'}
                      </Muted>
                    </HStack>
                    <HStack gap="1">
                      <GhostButton size="xs" onClick={() => setOptionModal({ group, option })}>
                        Editar
                      </GhostButton>
                      <GhostButton
                        size="xs"
                        color="danger"
                        onClick={() => removeOption(group.id, option.id)}
                      >
                        Quitar
                      </GhostButton>
                    </HStack>
                  </HStack>
                ))}
              </VStack>

              <GhostButton
                size="sm"
                alignSelf="flex-start"
                onClick={() => setOptionModal({ group, option: null })}
              >
                + Agregar opción
              </GhostButton>
            </VStack>
          </Card>
        ))
      )}

      {groupModal !== undefined ? (
        <ConfigGroupFormModal
          group={groupModal}
          isSubmitting={isMutating}
          onClose={() => setGroupModal(undefined)}
          onSubmit={async (input) => {
            if (groupModal) await updateGroup(groupModal.id, input)
            else await addGroup(input)
            setGroupModal(undefined)
          }}
        />
      ) : null}

      {optionModal ? (
        <ConfigOptionFormModal
          option={optionModal.option}
          isSubmitting={isMutating}
          onClose={() => setOptionModal(null)}
          onSubmit={async (input) => {
            if (optionModal.option) {
              await updateOption(optionModal.group.id, optionModal.option.id, input)
            } else {
              await addOption(optionModal.group.id, input)
            }
            setOptionModal(null)
          }}
        />
      ) : null}

      <ConfirmDeleteModal
        open={confirmGroup !== null}
        title="Eliminar grupo"
        description={`¿Eliminar el grupo ${confirmGroup?.name} y todas sus opciones? Esta acción no se puede deshacer.`}
        isSubmitting={isMutating}
        onClose={() => setConfirmGroup(null)}
        onConfirm={async () => {
          if (confirmGroup) await removeGroup(confirmGroup.id)
          setConfirmGroup(null)
        }}
      />
    </VStack>
  )
}

interface RecipeSectionProps {
  product: Product
  ingredients: Ingredient[]
  isMutating: boolean
  addRecipeItem: (input: RecipeItemInput) => Promise<void>
  updateRecipeItem: (itemId: string, input: RecipeItemInput) => Promise<void>
  removeRecipeItem: (itemId: string) => Promise<void>
}

const RecipeSection = ({
  product,
  ingredients,
  isMutating,
  addRecipeItem,
  updateRecipeItem,
  removeRecipeItem,
}: RecipeSectionProps) => {
  const [itemModal, setItemModal] = useState<RecipeItem | null | undefined>(undefined)
  const recipe = product.recipe ?? []

  return (
    <VStack align="stretch" gap="4">
      <HStack justify="space-between">
        <Strong fontSize="lg">Receta</Strong>
        <PrimaryButton size="md" onClick={() => setItemModal(null)}>
          Agregar ingrediente
        </PrimaryButton>
      </HStack>

      {recipe.length === 0 ? (
        <EmptyState
          icon={<Layers width={40} height={40} />}
          title="Sin ingredientes"
          description="Definí qué ingredientes (y cuánto) usa este producto."
        />
      ) : (
        <VStack align="stretch" gap="2">
          {recipe.map((item) => (
            <Card
              key={item.id}
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              gap="4"
              borderRadius="xl"
              paddingX="4"
              paddingY="3"
            >
              <VStack align="start" gap="0.5">
                <Strong fontSize="sm">{item.ingredient?.name ?? '—'}</Strong>
                <Muted fontSize="sm">
                  {item.quantity} {item.ingredient?.unit ?? '—'}
                </Muted>
              </VStack>
              <HStack gap="1">
                <GhostButton size="xs" onClick={() => setItemModal(item)}>
                  Editar
                </GhostButton>
                <GhostButton size="xs" color="danger" onClick={() => removeRecipeItem(item.id)}>
                  Quitar
                </GhostButton>
              </HStack>
            </Card>
          ))}
        </VStack>
      )}

      {itemModal !== undefined ? (
        <RecipeItemFormModal
          item={itemModal}
          ingredients={ingredients}
          isSubmitting={isMutating}
          onClose={() => setItemModal(undefined)}
          onSubmit={async (input) => {
            if (itemModal) await updateRecipeItem(itemModal.id, input)
            else await addRecipeItem(input)
            setItemModal(undefined)
          }}
        />
      ) : null}
    </VStack>
  )
}

export const ProductEditPage = () => {
  const { productId } = useParams()
  const id = productId
  const isNew = id == null
  const navigate = useNavigate()

  const {
    product,
    isLoading,
    isMutating,
    save,
    addGroup,
    updateGroup,
    removeGroup,
    addOption,
    updateOption,
    removeOption,
    addRecipeItem,
    updateRecipeItem,
    removeRecipeItem,
  } = useProductEditor(id)
  const { categories } = useAdminCategories()
  const { ingredients } = useIngredients()
  const { uploadImage, isUploading: isUploadingImage } = useImageUpload()

  const categoryOptions = useMemo(() => optionsFromEntities(categories), [categories])

  const handleSave = async (input: ProductInput) => {
    const savedId = await save(input)
    if (isNew && savedId != null) navigate(productEditPath(savedId))
  }

  return (
    <EditPageShell
      isNew={isNew}
      isLoading={isLoading}
      hasEntity={product != null}
      title={isNew ? 'Nuevo producto' : (product?.name ?? 'Producto')}
      loadingTitle="Producto"
      notFound={{
        title: 'Producto no encontrado',
        description: 'El producto que buscás no existe.',
      }}
    >
      {isNew ? (
        <DataForm
          categories={categoryOptions}
          product={null}
          isSubmitting={isMutating || isUploadingImage}
          onUploadImage={uploadImage}
          isUploadingImage={isUploadingImage}
          onSubmit={handleSave}
          onCancel={() => navigate(routes.products)}
        />
      ) : product ? (
        <EditPageTabs
          defaultValue="data"
          tabs={[
            {
              value: 'data',
              label: 'Datos generales',
              content: (
                <DataForm
                  categories={categoryOptions}
                  product={product}
                  isSubmitting={isMutating || isUploadingImage}
                  onUploadImage={uploadImage}
                  isUploadingImage={isUploadingImage}
                  onSubmit={handleSave}
                  onCancel={() => navigate(routes.products)}
                />
              ),
            },
            {
              value: 'configs',
              label: 'Configuraciones',
              content: (
                <ConfigsSection
                  product={product}
                  isMutating={isMutating}
                  addGroup={addGroup}
                  updateGroup={updateGroup}
                  removeGroup={removeGroup}
                  addOption={addOption}
                  updateOption={updateOption}
                  removeOption={removeOption}
                />
              ),
            },
            {
              value: 'recipe',
              label: 'Receta',
              content: (
                <RecipeSection
                  product={product}
                  ingredients={ingredients}
                  isMutating={isMutating}
                  addRecipeItem={addRecipeItem}
                  updateRecipeItem={updateRecipeItem}
                  removeRecipeItem={removeRecipeItem}
                />
              ),
            },
          ]}
        />
      ) : null}
    </EditPageShell>
  )
}
