import { useCallback, useState } from 'react'
import useSWR from 'swr'
import type {
  ConfigGroupInput,
  ConfigOptionInput,
  Product,
  ProductConfigGroup,
  ProductInput,
  ProductOption,
  RecipeItem,
  RecipeItemInput,
} from '@repo/domain'
import { deleteJson, getJson, patchJson, postJson } from '../client/rest'
import { getProductById, MOCK_PRODUCTS } from '../mocks/catalog'
import { getIngredientById } from '../mocks/ingredients'
import { getProductRecipe, MOCK_RECIPES } from '../mocks/recipes'

const withRecipe = (product: Product): Product => ({
  ...product,
  recipe: product.recipe.length ? product.recipe : getProductRecipe(product.id),
})

const fallbackFor = (productId: string | undefined): Product | null => {
  if (!productId) return null
  const product = getProductById(productId)
  return product ? withRecipe(product) : null
}

const syncMock = (product: Product) => {
  const index = MOCK_PRODUCTS.findIndex((item) => item.id === product.id)
  if (index !== -1) MOCK_PRODUCTS[index] = product
  else MOCK_PRODUCTS.push(product)
  MOCK_RECIPES[product.id] = product.recipe
}

interface UseProductEditorReturn {
  product: Product | null
  isLoading: boolean
  isMutating: boolean
  save: (input: ProductInput) => Promise<string | null>
  addGroup: (input: ConfigGroupInput) => Promise<void>
  updateGroup: (groupId: string, input: ConfigGroupInput) => Promise<void>
  removeGroup: (groupId: string) => Promise<void>
  addOption: (groupId: string, input: ConfigOptionInput) => Promise<void>
  updateOption: (groupId: string, optionId: string, input: ConfigOptionInput) => Promise<void>
  removeOption: (groupId: string, optionId: string) => Promise<void>
  addRecipeItem: (input: RecipeItemInput) => Promise<void>
  updateRecipeItem: (itemId: string, input: RecipeItemInput) => Promise<void>
  removeRecipeItem: (itemId: string) => Promise<void>
}

export const useProductEditor = (productId: string | undefined): UseProductEditorReturn => {
  const { data, isLoading, mutate } = useSWR<Product | null>(
    productId ? `/api/catalog/products/${productId}` : null,
    async (url: string) => {
      const json = await getJson<Product>(url)
      if (json && typeof json === 'object' && 'id' in json) return withRecipe(json)
      return fallbackFor(productId)
    },
  )

  const [isMutating, setIsMutating] = useState(false)

  const save = useCallback(
    async (input: ProductInput): Promise<string | null> => {
      setIsMutating(true)
      let id = productId ?? null
      if (id == null) {
        id = String(Date.now())
        syncMock({ ...input, image: input.image ?? null, id, configGroups: [], recipe: [] })
        await postJson('/api/catalog/products', input)
      } else {
        const base = data ?? fallbackFor(productId)
        if (base) {
          const updated: Product = { ...base, ...input, id }
          syncMock(updated)
          await mutate(updated, { revalidate: false })
        }
        await patchJson(`/api/catalog/products/${id}`, input)
      }
      setIsMutating(false)
      return id
    },
    [data, mutate, productId],
  )

  const addGroup = useCallback(
    async (input: ConfigGroupInput) => {
      const base = data ?? fallbackFor(productId)
      if (!base) return
      setIsMutating(true)
      const group: ProductConfigGroup = {
        id: String(Date.now()),
        name: input.name,
        type: input.type,
        required: input.required,
        min: input.min ?? null,
        max: input.max ?? null,
        options: [],
      }
      syncMock({ ...base, configGroups: [...base.configGroups, group] })
      await mutate({ ...base, configGroups: [...base.configGroups, group] }, { revalidate: false })
      await postJson(`/api/catalog/products/${base.id}/configurations`, input)
      setIsMutating(false)
    },
    [data, mutate, productId],
  )

  const updateGroup = useCallback(
    async (groupId: string, input: ConfigGroupInput) => {
      const base = data ?? fallbackFor(productId)
      if (!base) return
      setIsMutating(true)
      const configGroups = base.configGroups.map((group) =>
        group.id === groupId ? { ...group, ...input } : group,
      )
      syncMock({ ...base, configGroups })
      await mutate({ ...base, configGroups }, { revalidate: false })
      await patchJson(`/api/catalog/products/${base.id}/configurations/${groupId}`, input)
      setIsMutating(false)
    },
    [data, mutate, productId],
  )

  const removeGroup = useCallback(
    async (groupId: string) => {
      const base = data ?? fallbackFor(productId)
      if (!base) return
      setIsMutating(true)
      const configGroups = base.configGroups.filter((group) => group.id !== groupId)
      syncMock({ ...base, configGroups })
      await mutate({ ...base, configGroups }, { revalidate: false })
      await deleteJson(`/api/catalog/products/${base.id}/configurations/${groupId}`)
      setIsMutating(false)
    },
    [data, mutate, productId],
  )

  const addOption = useCallback(
    async (groupId: string, input: ConfigOptionInput) => {
      const base = data ?? fallbackFor(productId)
      if (!base) return
      setIsMutating(true)
      const option: ProductOption = { id: String(Date.now()), ...input }
      const configGroups = base.configGroups.map((group) =>
        group.id === groupId ? { ...group, options: [...group.options, option] } : group,
      )
      syncMock({ ...base, configGroups })
      await mutate({ ...base, configGroups }, { revalidate: false })
      await postJson(`/api/catalog/products/${base.id}/configurations/${groupId}/options`, input)
      setIsMutating(false)
    },
    [data, mutate, productId],
  )

  const updateOption = useCallback(
    async (groupId: string, optionId: string, input: ConfigOptionInput) => {
      const base = data ?? fallbackFor(productId)
      if (!base) return
      setIsMutating(true)
      const configGroups = base.configGroups.map((group) =>
        group.id === groupId
          ? {
              ...group,
              options: group.options.map((option) =>
                option.id === optionId ? { ...option, ...input } : option,
              ),
            }
          : group,
      )
      syncMock({ ...base, configGroups })
      await mutate({ ...base, configGroups }, { revalidate: false })
      await patchJson(
        `/api/catalog/products/${base.id}/configurations/${groupId}/options/${optionId}`,
        input,
      )
      setIsMutating(false)
    },
    [data, mutate, productId],
  )

  const removeOption = useCallback(
    async (groupId: string, optionId: string) => {
      const base = data ?? fallbackFor(productId)
      if (!base) return
      setIsMutating(true)
      const configGroups = base.configGroups.map((group) =>
        group.id === groupId
          ? { ...group, options: group.options.filter((option) => option.id !== optionId) }
          : group,
      )
      syncMock({ ...base, configGroups })
      await mutate({ ...base, configGroups }, { revalidate: false })
      await deleteJson(
        `/api/catalog/products/${base.id}/configurations/${groupId}/options/${optionId}`,
      )
      setIsMutating(false)
    },
    [data, mutate, productId],
  )

  const addRecipeItem = useCallback(
    async (input: RecipeItemInput) => {
      const base = data ?? fallbackFor(productId)
      if (!base) return
      const ingredient = getIngredientById(input.ingredientId)
      if (!ingredient) return
      setIsMutating(true)
      const item: RecipeItem = {
        id: String(Date.now()),
        ingredientId: input.ingredientId,
        quantity: input.quantity,
        ingredient,
      }
      const recipe = [...base.recipe, item]
      syncMock({ ...base, recipe })
      await mutate({ ...base, recipe }, { revalidate: false })
      await postJson(`/api/catalog/products/${base.id}/recipe/items`, input)
      setIsMutating(false)
    },
    [data, mutate, productId],
  )

  const updateRecipeItem = useCallback(
    async (itemId: string, input: RecipeItemInput) => {
      const base = data ?? fallbackFor(productId)
      if (!base) return
      const ingredient = getIngredientById(input.ingredientId)
      if (!ingredient) return
      setIsMutating(true)
      const recipe = base.recipe.map((item) =>
        item.id === itemId
          ? { ...item, ingredientId: input.ingredientId, quantity: input.quantity, ingredient }
          : item,
      )
      syncMock({ ...base, recipe })
      await mutate({ ...base, recipe }, { revalidate: false })
      await patchJson(`/api/catalog/products/${base.id}/recipe/items/${itemId}`, input)
      setIsMutating(false)
    },
    [data, mutate, productId],
  )

  const removeRecipeItem = useCallback(
    async (itemId: string) => {
      const base = data ?? fallbackFor(productId)
      if (!base) return
      setIsMutating(true)
      const recipe = base.recipe.filter((item) => item.id !== itemId)
      syncMock({ ...base, recipe })
      await mutate({ ...base, recipe }, { revalidate: false })
      await deleteJson(`/api/catalog/products/${base.id}/recipe/items/${itemId}`)
      setIsMutating(false)
    },
    [data, mutate, productId],
  )

  return {
    product: data ?? null,
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
  }
}
