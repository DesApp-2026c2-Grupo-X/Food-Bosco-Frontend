export type AuthErrorKind =
  | 'throttled'
  | 'invalidToken'
  | 'invalidCredentials'
  | 'inactiveUser'
  | 'emailTaken'
  | 'network'
  | 'unknown'

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
  invalidCredentials: 'El correo o la contraseña no son correctos. Revisalos e intentá de nuevo.',
  inactiveUser: 'Tu cuenta está desactivada. Contactá a soporte para reactivarla.',
  emailTaken: 'Ya existe una cuenta registrada con ese correo. Probá iniciando sesión.',
  network: 'No pudimos conectar con el servidor. Revisá tu conexión e intentá de nuevo.',
} as const

const CODE_TO_KIND: Record<string, AuthErrorKind> = {
  TOO_MANY_REQUESTS: 'throttled',
  INVALID_CREDENTIALS: 'invalidCredentials',
  USER_INACTIVE: 'inactiveUser',
  EMAIL_TAKEN: 'emailTaken',
  INVALID_OR_EXPIRED_TOKEN: 'invalidToken',
  INVALID_REFRESH_TOKEN: 'invalidToken',
}

const getGraphQLErrors = (error: unknown): GraphQLErrorLike[] => {
  if (typeof error !== 'object' || error === null) return []
  const { graphQLErrors } = error as ApolloErrorLike
  return Array.isArray(graphQLErrors) ? graphQLErrors : []
}

const getNetworkStatus = (error: unknown): number | undefined => {
  if (typeof error !== 'object' || error === null) return undefined
  return (error as ApolloErrorLike).networkError?.statusCode
}

const getGraphQLCode = (error: unknown): AuthErrorKind | undefined => {
  for (const graphQLError of getGraphQLErrors(error)) {
    const code = graphQLError.extensions?.code
    if (code && CODE_TO_KIND[code]) return CODE_TO_KIND[code]
  }
  return undefined
}

const isThrottled = (error: unknown) => {
  if (getNetworkStatus(error) === 429) return true

  return getGraphQLErrors(error).some(
    (graphQLError) =>
      graphQLError.extensions?.code === 'TOO_MANY_REQUESTS' ||
      /too many|demasiad|throttl|rate limit/i.test(graphQLError.message ?? ''),
  )
}

const matchesMessage = (error: unknown, pattern: RegExp) =>
  getGraphQLErrors(error).some((graphQLError) => pattern.test(graphQLError.message ?? ''))

const isEmailTaken = (error: unknown) =>
  matchesMessage(error, /correo ya|ya est[aá] registrad|ya existe|email.*taken|already.*regist/i)

const isInactiveUser = (error: unknown) =>
  matchesMessage(error, /inactiv|desactiv|bloquead|suspend|disabled/i)

const isInvalidCredentials = (error: unknown) =>
  matchesMessage(
    error,
    /credencial|correo o la contrase|usuario o la contrase|password.*incorrect/i,
  )

const isInvalidToken = (error: unknown) =>
  matchesMessage(error, /token|enlace|expir|inv[aá]lid|utilizad|used|recuperaci/i)

export const classifyAuthError = (error: unknown): AuthErrorKind => {
  const byCode = getGraphQLCode(error)
  if (byCode) return byCode
  if (isThrottled(error)) return 'throttled'
  if (isEmailTaken(error)) return 'emailTaken'
  if (isInactiveUser(error)) return 'inactiveUser'
  if (isInvalidCredentials(error)) return 'invalidCredentials'
  if (isInvalidToken(error)) return 'invalidToken'
  if (getNetworkStatus(error) !== undefined) return 'network'
  return 'unknown'
}

export const authErrorMessage = (kind: AuthErrorKind, fallback: string) =>
  kind === 'unknown' ? fallback : AUTH_ERROR_MESSAGES[kind]
