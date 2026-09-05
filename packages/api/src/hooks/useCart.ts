import { useCallback } from 'react'
import { useMutation, useQuery } from '@apollo/client'
import type { AddCartItemInput, Cart, UpdateCartItemInput } from '@repo/domain'
import { ADD_CART_ITEM, MY_CART, REMOVE_CART_ITEM, UPDATE_CART_ITEM, toCart } from '../client/store'

interface UseCartReturn {
  cart: Cart | null
  isLoading: boolean
  isMutating: boolean
  addItem: (input: AddCartItemInput) => Promise<void>
  updateItem: (itemId: string, input: UpdateCartItemInput) => Promise<void>
  removeItem: (itemId: string) => Promise<void>
}

interface CartResult {
  myCart: Record<string, unknown>
}

export const useCart = (): UseCartReturn => {
  const { data, loading, refetch } = useQuery<CartResult>(MY_CART, {
    fetchPolicy: 'network-only',
  })

  const [addMutation, { loading: adding }] = useMutation(ADD_CART_ITEM)
  const [updateMutation, { loading: updating }] = useMutation(UPDATE_CART_ITEM)
  const [removeMutation, { loading: removing }] = useMutation(REMOVE_CART_ITEM)

  const addItem = useCallback(
    async (input: AddCartItemInput) => {
      await addMutation({ variables: { input } })
      await refetch()
    },
    [addMutation, refetch],
  )

  const updateItem = useCallback(
    async (itemId: string, input: UpdateCartItemInput) => {
      await updateMutation({ variables: { itemId, input } })
      await refetch()
    },
    [updateMutation, refetch],
  )

  const removeItem = useCallback(
    async (itemId: string) => {
      await removeMutation({ variables: { itemId } })
      await refetch()
    },
    [removeMutation, refetch],
  )

  return {
    cart: data?.myCart ? toCart(data.myCart) : null,
    isLoading: loading,
    isMutating: adding || updating || removing,
    addItem,
    updateItem,
    removeItem,
  }
}
