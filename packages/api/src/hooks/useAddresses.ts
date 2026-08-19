import { useCallback } from 'react'
import { useMutation, useQuery } from '@apollo/client'
import type { Address, AddressInput } from '@repo/domain'
import {
  CREATE_ADDRESS,
  DELETE_ADDRESS,
  MY_ADDRESSES,
  UPDATE_ADDRESS,
  toAddress,
  type CreateAddressResult,
  type DeleteAddressResult,
  type MyAddressesResult,
  type UpdateAddressResult,
} from '../client/operations'

interface UseAddressesReturn {
  addresses: Address[]
  isLoading: boolean
  create: (input: AddressInput) => Promise<Address | null>
  update: (id: string, input: AddressInput) => Promise<void>
  remove: (id: string) => Promise<void>
}

export const useAddresses = (): UseAddressesReturn => {
  const { data, loading, refetch } = useQuery<MyAddressesResult>(MY_ADDRESSES, {
    fetchPolicy: 'network-only',
  })

  const [createMutation] = useMutation<CreateAddressResult>(CREATE_ADDRESS)
  const [updateMutation] = useMutation<UpdateAddressResult>(UPDATE_ADDRESS)
  const [deleteMutation] = useMutation<DeleteAddressResult>(DELETE_ADDRESS)

  const create = useCallback(
    async (input: AddressInput): Promise<Address | null> => {
      const { data } = await createMutation({ variables: { input } })
      await refetch()
      return data?.createAddress ? toAddress(data.createAddress) : null
    },
    [createMutation, refetch],
  )

  const update = useCallback(
    async (id: string, input: AddressInput) => {
      await updateMutation({ variables: { id, input } })
      await refetch()
    },
    [updateMutation, refetch],
  )

  const remove = useCallback(
    async (id: string) => {
      await deleteMutation({ variables: { id } })
      await refetch()
    },
    [deleteMutation, refetch],
  )

  return {
    addresses: (data?.myAddresses ?? []).map(toAddress),
    isLoading: loading,
    create,
    update,
    remove,
  }
}
