import { describe, expect, it } from 'vitest'
import { AUTH_ERROR_MESSAGES, authErrorMessage, classifyAuthError } from '../authErrors'

const graphqlError = (message: string, code?: string) => ({
  graphQLErrors: [{ message, extensions: code ? { code } : undefined }],
})

describe('classifyAuthError', () => {
  it.each([
    { name: 'HTTP 429', error: { networkError: { statusCode: 429 } } },
    {
      name: 'código TOO_MANY_REQUESTS',
      error: graphqlError('demasiadas solicitudes', 'TOO_MANY_REQUESTS'),
    },
    { name: 'mensaje de rate limit', error: graphqlError('Too many requests') },
  ])('clasifica $name como throttled', ({ error }) => {
    expect(classifyAuthError(error)).toBe('throttled')
  })

  it.each([
    { name: 'código INVALID_OR_EXPIRED_TOKEN', error: graphqlError('x', 'INVALID_OR_EXPIRED_TOKEN') },
    { name: 'mensaje de token inválido', error: graphqlError('Token inválido o expirado') },
    { name: 'mensaje de enlace de recuperación', error: graphqlError('El enlace de recuperación venció') },
    { name: 'token ya utilizado', error: graphqlError('El token ya fue utilizado') },
  ])('clasifica $name como invalidToken', ({ error }) => {
    expect(classifyAuthError(error)).toBe('invalidToken')
  })

  it('clasifica un error de red como network', () => {
    expect(classifyAuthError({ networkError: { statusCode: 500 } })).toBe('network')
  })

  it.each([
    { name: 'null', error: null },
    { name: 'string', error: 'boom' },
    { name: 'error sin datos', error: {} },
    { name: 'error de GraphQL genérico', error: graphqlError('Algo salió mal') },
  ])('devuelve unknown para $name', ({ error }) => {
    expect(classifyAuthError(error)).toBe('unknown')
  })

  it('no clasifica como invalidToken un mensaje que sólo contiene "usado" sin token', () => {
    expect(classifyAuthError(graphqlError('El usuario ya usó la recuperación'))).not.toBe('invalidToken')
  })
})

describe('authErrorMessage', () => {
  it('devuelve el mensaje mapeado para cada tipo conocido', () => {
    expect(authErrorMessage('throttled', 'fallback')).toBe(AUTH_ERROR_MESSAGES.throttled)
    expect(authErrorMessage('invalidToken', 'fallback')).toBe(AUTH_ERROR_MESSAGES.invalidToken)
    expect(authErrorMessage('network', 'fallback')).toBe(AUTH_ERROR_MESSAGES.network)
  })

  it('devuelve el fallback para unknown', () => {
    expect(authErrorMessage('unknown', 'mensaje por defecto')).toBe('mensaje por defecto')
  })
})
