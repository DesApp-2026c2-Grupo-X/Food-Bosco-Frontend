import type { Address, AddressInput } from '@repo/domain'
import {
  CREATE_ADDRESS,
  DELETE_ADDRESS,
  MY_ADDRESSES,
  UPDATE_ADDRESS,
  toAddress,
  type ApiAddress,
} from '../client/operations'
import { createCrudResource } from './createCrudResource'

interface UseAddressesReturn {
  addresses: Address[]
  isLoading: boolean
  create: (input: AddressInput) => Promise<Address | null>
  update: (id: string, input: AddressInput) => Promise<void>
  remove: (id: string) => Promise<void>
}

const useAddressesResource = createCrudResource({
  query: {
    document: MY_ADDRESSES,
    resultKey: 'myAddresses',
    as: 'addresses',
    map: toAddress,
    fetchPolicy: 'cache-and-network',
  },
  create: {
    document: CREATE_ADDRESS,
    variables: (input: AddressInput) => ({ input }),
    select: (data) => (data?.createAddress ? toAddress(data.createAddress as ApiAddress) : null),
  },
  update: {
    document: UPDATE_ADDRESS,
    variables: (id: string, input: AddressInput) => ({ id, input }),
  },
  remove: {
    document: DELETE_ADDRESS,
    variables: (id: string) => ({ id }),
  },
})

export const useAddresses = (): UseAddressesReturn => {
  const { addresses, isLoading, create, update, remove } = useAddressesResource()
  return { addresses, isLoading, create, update, remove }
}
