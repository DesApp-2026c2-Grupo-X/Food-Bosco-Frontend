import { APP_ROLE_MISMATCH_MESSAGE } from '@repo/domain'

export interface FieldValidationError {
  field: string
  message: string
}

interface GraphQLErrorLike {
  message?: string
  extensions?: {
    code?: string
    details?: {
      fields?: FieldValidationError[]
      requestedQuantity?: number
      availableQuantity?: number
    }
  }
}

interface ApolloErrorLike {
  graphQLErrors?: GraphQLErrorLike[]
  networkError?: { statusCode?: number } | null
}

export const DEFAULT_API_ERROR_MESSAGE =
  'No pudimos completar la operación. Intentá de nuevo en unos instantes.'

export const NETWORK_ERROR_MESSAGE =
  'No pudimos conectar con el servidor. Revisá tu conexión e intentá de nuevo.'

const CODE_MESSAGES: Record<string, string> = {
  UNAUTHENTICATED: 'Tu sesión expiró o no es válida. Iniciá sesión nuevamente.',
  FORBIDDEN: 'No tenés permisos para realizar esta acción.',
  TOO_MANY_REQUESTS: 'Demasiados intentos. Esperá un minuto antes de volver a intentarlo.',
  SERVICE_UNAVAILABLE: 'El servicio no está disponible en este momento. Intentá de nuevo en breve.',
  INTERNAL_SERVER_ERROR: DEFAULT_API_ERROR_MESSAGE,
  INVALID_CREDENTIALS: 'El correo electrónico o la contraseña son incorrectos.',
  APP_ROLE_MISMATCH: APP_ROLE_MISMATCH_MESSAGE,
  EMAIL_TAKEN: 'Ese correo ya está registrado. Probá iniciar sesión o usá otro correo.',
  USER_INACTIVE: 'Tu cuenta está deshabilitada. Contactá al administrador.',
  INVALID_OR_EXPIRED_TOKEN:
    'El enlace no es válido o ya expiró. Solicitá uno nuevo para continuar.',
  INVALID_REFRESH_TOKEN: 'Tu sesión expiró. Iniciá sesión nuevamente.',
  CART_NOT_FOUND: 'Tu carrito está vacío o ya no está disponible. Agregá productos para continuar.',
  CART_CONFIRMED: 'Este carrito ya fue usado en otro pedido. Actualizalo para continuar.',
  PRODUCT_NOT_FOUND: 'El producto ya no existe en el catálogo.',
  PRODUCT_UNAVAILABLE: 'Ese producto ya no está disponible. Elegí otro para continuar.',
  ORDER_NOT_FOUND: 'No encontramos el pedido solicitado.',
  INVALID_TRANSITION:
    'El pedido cambió de estado. Actualizá la pantalla antes de intentar de nuevo.',
  NO_BRANCH_AVAILABLE: 'No hay una sucursal disponible para esa dirección.',
  CONFLICT: 'La información cambió mientras realizabas la operación. Actualizá e intentá de nuevo.',
  VALIDATION_ERROR: 'Revisá los datos ingresados e intentá de nuevo.',
}

const TECHNICAL_MESSAGE =
  /^(internal server error|error|unauthorized|forbidden|not found|bad request|fetch failed|failed to fetch|network error|response not successful|econnrefused|etimedout|enotfound|socket hang up)/i

const getGraphQLErrors = (error: unknown): GraphQLErrorLike[] => {
  if (typeof error !== 'object' || error === null) return []
  const { graphQLErrors } = error as ApolloErrorLike
  return Array.isArray(graphQLErrors) ? graphQLErrors : []
}

const isNetworkError = (error: unknown): boolean => {
  if (typeof error !== 'object' || error === null) return false
  return (error as ApolloErrorLike).networkError != null
}

const stockMessage = (error: GraphQLErrorLike): string | undefined => {
  const details = error.extensions?.details
  if (error.extensions?.code !== 'INSUFFICIENT_STOCK' || !details) return undefined
  if (typeof details.requestedQuantity !== 'number') return undefined

  const available =
    typeof details.availableQuantity === 'number' ? details.availableQuantity : undefined

  return available === undefined
    ? `No hay stock suficiente para la cantidad solicitada (${details.requestedQuantity}).`
    : `Solo quedan ${available} unidades disponibles. Ajustá la cantidad para continuar.`
}

/**
 * Traduce un error de Apollo/GraphQL a un mensaje accionable en español.
 * Prioriza el detalle de validación del backend y evita mostrar textos técnicos.
 */
export const getApiErrorMessage = (
  error: unknown,
  fallback: string = DEFAULT_API_ERROR_MESSAGE,
): string => {
  const graphQLErrors = getGraphQLErrors(error)
  const first = graphQLErrors[0]

  const fieldMessage = graphQLErrors
    .flatMap((graphQLError) => graphQLError.extensions?.details?.fields ?? [])
    .find((field) => field.message)?.message

  if (fieldMessage) return fieldMessage

  const stock = first ? stockMessage(first) : undefined
  if (stock) return stock

  const message = first?.message?.trim()
  if (message && !TECHNICAL_MESSAGE.test(message)) return message

  const code = first?.extensions?.code
  if (code && CODE_MESSAGES[code]) return CODE_MESSAGES[code]

  if (isNetworkError(error)) return NETWORK_ERROR_MESSAGE

  return fallback
}
