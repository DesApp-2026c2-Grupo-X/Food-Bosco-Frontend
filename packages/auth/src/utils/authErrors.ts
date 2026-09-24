export type AuthErrorKind = 'throttled' | 'invalidToken' | 'network' | 'unknown'

interface GraphQLErrorLike {
  message?: string
  extensions?: { code?: string }
}

interface ApolloErrorLike {
  graphQLErrors?: GraphQLErrorLike[]
  networkError?: { statusCode?: number } | null
}

export const AUTH_ERROR_MESSAGES = {
  throttled: 'Se realizaron demasiados intentos. Esperá unos minutos antes de volver a intentarlo.',
  invalidToken:
    'El enlace de recuperación no es válido o ya expiró. Solicitá un nuevo enlace para continuar.',
  network: 'No pudimos conectar con el servidor. Revisá tu conexión e intentá de nuevo.',
} as const

const getGraphQLErrors = (error: unknown): GraphQLErrorLike[] => {
  if (typeof error !== 'object' || error === null) return []
  const { graphQLErrors } = error as ApolloErrorLike
  return Array.isArray(graphQLErrors) ? graphQLErrors : []
}

const getNetworkStatus = (error: unknown): number | undefined => {
  if (typeof error !== 'object' || error === null) return undefined
  return (error as ApolloErrorLike).networkError?.statusCode
}

const isThrottled = (error: unknown) => {
  if (getNetworkStatus(error) === 429) return true

  return getGraphQLErrors(error).some(
    (graphQLError) =>
      graphQLError.extensions?.code === 'TOO_MANY_REQUESTS' ||
      /too many|demasiad|throttl|rate limit/i.test(graphQLError.message ?? ''),
  )
}

const isInvalidToken = (error: unknown) =>
  getGraphQLErrors(error).some((graphQLError) =>
    /token|enlace|expir|inv[aá]lid|utilizad|used|recuperaci/i.test(graphQLError.message ?? ''),
  )

export const classifyAuthError = (error: unknown): AuthErrorKind => {
  if (isThrottled(error)) return 'throttled'
  if (isInvalidToken(error)) return 'invalidToken'
  if (getNetworkStatus(error) !== undefined) return 'network'
  return 'unknown'
}

export const authErrorMessage = (kind: AuthErrorKind, fallback: string) =>
  kind === 'unknown' ? fallback : AUTH_ERROR_MESSAGES[kind]
