import { useCallback } from 'react'
import { useMutation, useQuery } from '@apollo/client'
import type { AddCartItemInput, Cart, CartItem, UpdateCartItemInput } from '@repo/domain'
import { ADD_CART_ITEM, MY_CART, REMOVE_CART_ITEM, UPDATE_CART_ITEM, toCart } from '../client/store'
import { combineLoading } from '../utils/combineLoading'

const sameOptions = (a: string[], b: string[]): boolean => {
  if (a.length !== b.length) return false
  const sortedA = [...a].sort()
  const sortedB = [...b].sort()
  return sortedA.every((value, index) => value === sortedB[index])
}

export const findMatchingCartItem = (
  items: CartItem[],
  input: AddCartItemInput,
): CartItem | undefined =>
  items.find(
    (item) =>
      item.productId === input.productId &&
      sameOptions(item.optionIds, input.optionIds ?? []) &&
      (item.observations?.trim() || null) === (input.observations?.trim() || null),
  )

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

  const cart = data?.myCart ? toCart(data.myCart) : null

  const addItem = useCallback(
    async (input: AddCartItemInput) => {
      const existing = findMatchingCartItem(cart?.items ?? [], input)
      if (existing) {
        await updateMutation({
          variables: {
            itemId: existing.id,
            input: { quantity: existing.quantity + input.quantity },
          },
        })
      } else {
        await addMutation({ variables: { input } })
      }
      await refetch()
    },
    [addMutation, updateMutation, refetch, cart],
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
    cart,
    isLoading: loading,
    isMutating: combineLoading(adding, updating, removing),
    addItem,
    updateItem,
    removeItem,
  }
}
