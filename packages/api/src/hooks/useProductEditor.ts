import { useCallback } from 'react'
import { useMutation, useQuery } from '@apollo/client'
import type {
  ConfigGroupInput,
  ConfigOptionInput,
  Product,
  ProductInput,
  RecipeItemInput,
} from '@repo/domain'
import {
  ADD_RECIPE_ITEM,
  ADMIN_PRODUCT,
  CREATE_CONFIG_GROUP,
  CREATE_CONFIG_OPTION,
  CREATE_PRODUCT,
  DELETE_CONFIG_GROUP,
  DELETE_CONFIG_OPTION,
  REMOVE_RECIPE_ITEM,
  UPDATE_CONFIG_GROUP,
  UPDATE_CONFIG_OPTION,
  UPDATE_PRODUCT,
  UPDATE_RECIPE_ITEM,
  toConfigGroupType,
  toProduct,
} from '../client/admin'

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

interface ProductResult {
  product: Record<string, unknown> | null
}

interface CreateProductResult {
  createProduct: Record<string, unknown> | null
}

const groupInput = (input: ConfigGroupInput) => ({
  name: input.name,
  type: toConfigGroupType(input.type),
  required: input.required,
  min: input.min ?? null,
  max: input.max ?? null,
})

export const useProductEditor = (productId: string | undefined): UseProductEditorReturn => {
  const { data, loading, refetch } = useQuery<ProductResult>(ADMIN_PRODUCT, {
    variables: { id: productId },
    skip: !productId,
    fetchPolicy: 'network-only',
  })

  const [createProductMutation, { loading: savingProduct }] =
    useMutation<CreateProductResult>(CREATE_PRODUCT)
  const [updateProductMutation, { loading: updatingProduct }] = useMutation(UPDATE_PRODUCT)
  const [createGroupMutation, { loading: creatingGroup }] = useMutation(CREATE_CONFIG_GROUP)
  const [updateGroupMutation, { loading: updatingGroup }] = useMutation(UPDATE_CONFIG_GROUP)
  const [deleteGroupMutation, { loading: deletingGroup }] = useMutation(DELETE_CONFIG_GROUP)
  const [createOptionMutation, { loading: creatingOption }] = useMutation(CREATE_CONFIG_OPTION)
  const [updateOptionMutation, { loading: updatingOption }] = useMutation(UPDATE_CONFIG_OPTION)
  const [deleteOptionMutation, { loading: deletingOption }] = useMutation(DELETE_CONFIG_OPTION)
  const [addRecipeMutation, { loading: addingRecipe }] = useMutation(ADD_RECIPE_ITEM)
  const [updateRecipeMutation, { loading: updatingRecipe }] = useMutation(UPDATE_RECIPE_ITEM)
  const [removeRecipeMutation, { loading: removingRecipe }] = useMutation(REMOVE_RECIPE_ITEM)

  const save = useCallback(
    async (input: ProductInput): Promise<string | null> => {
      if (productId == null) {
        const { data: result } = await createProductMutation({ variables: { input } })
        return result?.createProduct ? String(result.createProduct.id) : null
      }
      await updateProductMutation({ variables: { id: productId, input } })
      await refetch()
      return productId
    },
    [createProductMutation, productId, refetch, updateProductMutation],
  )

  const addGroup = useCallback(
    async (input: ConfigGroupInput) => {
      if (!productId) return
      await createGroupMutation({ variables: { productId, input: groupInput(input) } })
      await refetch()
    },
    [createGroupMutation, productId, refetch],
  )

  const updateGroup = useCallback(
    async (groupId: string, input: ConfigGroupInput) => {
      if (!productId) return
      await updateGroupMutation({ variables: { productId, groupId, input: groupInput(input) } })
      await refetch()
    },
    [productId, refetch, updateGroupMutation],
  )

  const removeGroup = useCallback(
    async (groupId: string) => {
      if (!productId) return
      await deleteGroupMutation({ variables: { productId, groupId } })
      await refetch()
    },
    [deleteGroupMutation, productId, refetch],
  )

  const addOption = useCallback(
    async (groupId: string, input: ConfigOptionInput) => {
      if (!productId) return
      await createOptionMutation({ variables: { productId, groupId, input } })
      await refetch()
    },
    [createOptionMutation, productId, refetch],
  )

  const updateOption = useCallback(
    async (groupId: string, optionId: string, input: ConfigOptionInput) => {
      if (!productId) return
      await updateOptionMutation({ variables: { productId, groupId, optionId, input } })
      await refetch()
    },
    [productId, refetch, updateOptionMutation],
  )

  const removeOption = useCallback(
    async (groupId: string, optionId: string) => {
      if (!productId) return
      await deleteOptionMutation({ variables: { productId, groupId, optionId } })
      await refetch()
    },
    [deleteOptionMutation, productId, refetch],
  )

  const addRecipeItem = useCallback(
    async (input: RecipeItemInput) => {
      if (!productId) return
      await addRecipeMutation({ variables: { productId, input } })
      await refetch()
    },
    [addRecipeMutation, productId, refetch],
  )

  const updateRecipeItem = useCallback(
    async (itemId: string, input: RecipeItemInput) => {
      if (!productId) return
      await updateRecipeMutation({ variables: { productId, itemId, input } })
      await refetch()
    },
    [productId, refetch, updateRecipeMutation],
  )

  const removeRecipeItem = useCallback(
    async (itemId: string) => {
      if (!productId) return
      await removeRecipeMutation({ variables: { productId, itemId } })
      await refetch()
    },
    [productId, refetch, removeRecipeMutation],
  )

  return {
    product: data?.product ? toProduct(data.product) : null,
    isLoading: loading,
    isMutating:
      savingProduct ||
      updatingProduct ||
      creatingGroup ||
      updatingGroup ||
      deletingGroup ||
      creatingOption ||
      updatingOption ||
      deletingOption ||
      addingRecipe ||
      updatingRecipe ||
      removingRecipe,
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
