import {
  ApolloClient,
  from,
  fromPromise,
  HttpLink,
  InMemoryCache,
  type NormalizedCacheObject,
} from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { onError } from '@apollo/client/link/error'
import { useAuthStore } from '../stores/authStore'
import { REFRESH_TOKEN, type RefreshTokenResult } from './operations'

const httpLink = new HttpLink({ uri: '/graphql' })

const authLink = setContext((_, { headers }) => {
  const token = useAuthStore.getState().accessToken

  return {
    headers: {
      ...headers,
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
  }
})

let refreshPromise: Promise<boolean> | null = null

const refreshAccessToken = async (): Promise<boolean> => {
  const refreshToken = useAuthStore.getState().refreshToken
  if (!refreshToken) {
    return false
  }

  try {
    const { data } = await apolloClient.mutate<RefreshTokenResult>({
      mutation: REFRESH_TOKEN,
      variables: { refreshToken },
    })

    const session = data?.refreshToken
    if (!session?.accessToken) {
      return false
    }

    useAuthStore.getState().applyTokens(session.accessToken, session.refreshToken)
    return true
  } catch {
    useAuthStore.getState().logout()
    return false
  }
}

const errorLink = onError(({ graphQLErrors, operation, forward }) => {
  const isUnauthenticated = graphQLErrors?.some(
    (error) => error.extensions?.code === 'UNAUTHENTICATED',
  )

  if (!isUnauthenticated) {
    return
  }

  refreshPromise ??= refreshAccessToken().finally(() => {
    refreshPromise = null
  })

  return fromPromise(refreshPromise)
    .filter((refreshed) => refreshed)
    .flatMap(() => forward(operation))
})

export const apolloClient = new ApolloClient<NormalizedCacheObject>({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache(),
})
