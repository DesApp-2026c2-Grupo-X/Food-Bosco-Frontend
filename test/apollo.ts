import {
  ApolloClient,
  ApolloLink,
  InMemoryCache,
  Observable,
  type FetchResult,
  type Operation,
} from '@apollo/client'

export type OperationHandler = (
  operation: Operation,
) => FetchResult | Error | Promise<FetchResult | Error>

export interface TestApolloClient {
  client: ApolloClient<unknown>
  requests: Operation[]
  lastRequest: (operationName: string) => Operation | undefined
  requestsByName: (operationName: string) => Operation[]
}

export const createTestClient = (handler: OperationHandler): TestApolloClient => {
  const requests: Operation[] = []

  const link = new ApolloLink((operation) => {
    requests.push(operation)
    return new Observable((observer) => {
      Promise.resolve()
        .then(() => handler(operation))
        .then((result) => {
          if (result instanceof Error) {
            observer.error(result)
            return
          }
          observer.next(result)
          observer.complete()
        })
        .catch((error) => observer.error(error))
    })
  })

  const client = new ApolloClient({ link, cache: new InMemoryCache() })

  return {
    client,
    requests,
    lastRequest: (operationName) =>
      [...requests].reverse().find((operation) => operation.operationName === operationName),
    requestsByName: (operationName) =>
      requests.filter((operation) => operation.operationName === operationName),
  }
}

export const operationVariables = (operation: Operation | undefined) => operation?.variables ?? {}
