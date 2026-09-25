import { useCallback } from 'react'
import type { ApolloClient, DocumentNode, WatchQueryFetchPolicy } from '@apollo/client'
import { gql, useApolloClient, useMutation, useQuery } from '@apollo/client'
import { combineLoading } from '../utils/combineLoading'

type AnyRecord = Record<string, unknown>

const NOOP_MUTATION = gql`
  mutation CrudNoop {
    __typename
  }
`

export interface CrudOperation<
  TArgs extends readonly unknown[] = readonly unknown[],
  TResult = void,
> {
  document: DocumentNode
  variables: (...args: TArgs) => AnyRecord
  refetch?: boolean
  refetchQueries?: DocumentNode[]
  select?: (data: AnyRecord | undefined) => TResult
}

export interface CrudQueryConfig<
  TResultKey extends string = string,
  TItemsKey extends string = TResultKey,
  TRaw = AnyRecord,
  TItem = unknown,
  TData = AnyRecord,
> {
  document: DocumentNode
  resultKey: TResultKey
  as?: TItemsKey
  map: (raw: TRaw) => TItem
  variables?: AnyRecord | (() => AnyRecord)
  skip?: boolean
  fetchPolicy?: WatchQueryFetchPolicy
  pollInterval?: number
  select?: (items: TItem[], data: TData | undefined) => TItem[]
}

export interface CrudResourceConfig<
  TQuery = CrudQueryConfig,
  TInput = unknown,
  TCreateResult = void,
  TExtra extends Record<string, CrudOperation<never, unknown>> = Record<string, never>,
> {
  query: TQuery
  create?: CrudOperation<readonly [input: TInput], TCreateResult>
  update?: CrudOperation<readonly [id: string, input: TInput], void>
  toggle?: CrudOperation<readonly [id: string, active: boolean], void>
  remove?: CrudOperation<readonly [id: string], void>
  extra?: TExtra
}

type OperationArgs<TDescriptor> = TDescriptor extends {
  variables: (...args: infer TArgs) => unknown
}
  ? TArgs
  : readonly unknown[]

type OperationResult<TDescriptor> = TDescriptor extends {
  select: (data: AnyRecord | undefined) => infer TResult
}
  ? TResult
  : void

type ExtraOperations<TExtra extends Record<string, CrudOperation<never, unknown>>> = {
  [K in keyof TExtra]: (...args: OperationArgs<TExtra[K]>) => Promise<OperationResult<TExtra[K]>>
}

export type CrudResourceResult<
  TItemsKey extends string,
  TItem,
  TInput,
  TCreateResult,
  TExtra extends Record<string, CrudOperation<never, unknown>>,
> = { [K in TItemsKey]: TItem[] } & {
  isLoading: boolean
  isMutating: boolean
  create: (input: TInput) => Promise<TCreateResult>
  update: (id: string, input: TInput) => Promise<void>
  toggle: (id: string, active: boolean) => Promise<void>
  remove: (id: string) => Promise<void>
} & ExtraOperations<TExtra>

interface CrudOperationRunner<TArgs extends readonly unknown[], TResult> {
  run: (...args: TArgs) => Promise<TResult | undefined>
  loading: boolean
}

const useCrudOperation = <TArgs extends readonly unknown[], TResult>(
  descriptor: CrudOperation<TArgs, TResult> | undefined,
  refetch: () => Promise<unknown>,
  client: ApolloClient<unknown>,
): CrudOperationRunner<TArgs, TResult> => {
  const [mutate, { loading }] = useMutation(descriptor?.document ?? NOOP_MUTATION)

  const run = useCallback(
    async (...args: TArgs): Promise<TResult | undefined> => {
      if (!descriptor) return undefined
      const { data } = await mutate({ variables: descriptor.variables(...args) })
      if (descriptor.refetchQueries && descriptor.refetchQueries.length > 0) {
        await client.refetchQueries({ include: descriptor.refetchQueries })
      } else if (descriptor.refetch !== false) {
        await refetch()
      }
      return descriptor.select ? descriptor.select(data as AnyRecord | undefined) : undefined
    },
    [client, descriptor, mutate, refetch],
  )

  return { run, loading }
}

export const createCrudResource = <
  TResultKey extends string,
  TItemsKey extends string = TResultKey,
  TRaw = AnyRecord,
  TItem = unknown,
  TData = AnyRecord,
  TInput = unknown,
  TCreateResult = void,
  TExtra extends Record<string, CrudOperation<never, unknown>> = Record<string, never>,
>(
  config: CrudResourceConfig<
    CrudQueryConfig<TResultKey, TItemsKey, TRaw, TItem, TData>,
    TInput,
    TCreateResult,
    TExtra
  >,
): (() => CrudResourceResult<TItemsKey, TItem, TInput, TCreateResult, TExtra>) => {
  const itemsKey = (config.query.as ?? config.query.resultKey) as TItemsKey
  const extraEntries = Object.entries(config.extra ?? {}) as [string, CrudOperation][]

  return () => {
    const client = useApolloClient()
    const variables =
      typeof config.query.variables === 'function'
        ? config.query.variables()
        : config.query.variables

    const { data, loading, refetch } = useQuery<TData>(config.query.document, {
      variables,
      skip: config.query.skip,
      fetchPolicy: config.query.fetchPolicy,
      pollInterval: config.query.pollInterval,
    })

    const create = useCrudOperation(config.create, refetch, client)
    const update = useCrudOperation(config.update, refetch, client)
    const toggle = useCrudOperation(config.toggle, refetch, client)
    const remove = useCrudOperation(config.remove, refetch, client)

    const extras = extraEntries.map(([name, descriptor]) => ({
      name,
      operation: useCrudOperation(descriptor, refetch, client),
    }))

    const rawItems = ((data as AnyRecord | undefined)?.[config.query.resultKey] ?? []) as TRaw[]
    const mapped = rawItems.map((raw) => config.query.map(raw))
    const items = config.query.select ? config.query.select(mapped, data) : mapped

    const isMutating = combineLoading(
      create.loading,
      update.loading,
      toggle.loading,
      remove.loading,
      ...extras.map(({ operation }) => operation.loading),
    )

    const result: AnyRecord = {
      [itemsKey]: items,
      isLoading: loading,
      isMutating,
    }

    if (config.create) result.create = create.run
    if (config.update) result.update = update.run
    if (config.toggle) result.toggle = toggle.run
    if (config.remove) result.remove = remove.run
    for (const { name, operation } of extras) result[name] = operation.run

    return result as unknown as CrudResourceResult<TItemsKey, TItem, TInput, TCreateResult, TExtra>
  }
}
