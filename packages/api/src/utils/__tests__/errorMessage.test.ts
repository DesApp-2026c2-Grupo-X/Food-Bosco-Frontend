import { describe, expect, it } from 'vitest'
import {
  DEFAULT_API_ERROR_MESSAGE,
  NETWORK_ERROR_MESSAGE,
  getApiErrorMessage,
} from '../errorMessage'

const graphQLError = (
  message: string,
  extensions?: Record<string, unknown>,
): { graphQLErrors: Array<{ message: string; extensions?: Record<string, unknown> }> } => ({
  graphQLErrors: [{ message, extensions }],
})

describe('getApiErrorMessage', () => {
  it.each([
    {
      name: 'prioriza el detalle de validación por campo',
      error: graphQLError('El campo no es válido', {
        code: 'VALIDATION_ERROR',
        details: { fields: [{ field: 'phone', message: 'Ingresá un teléfono válido' }] },
      }),
      expected: 'Ingresá un teléfono válido',
    },
    {
      name: 'usa el stock disponible para indicar cómo continuar',
      error: graphQLError('No hay stock suficiente para preparar el pedido.', {
        code: 'INSUFFICIENT_STOCK',
        details: { requestedQuantity: 5, availableQuantity: 3 },
      }),
      expected: 'Solo quedan 3 unidades disponibles. Ajustá la cantidad para continuar.',
    },
    {
      name: 'preserva un mensaje de dominio específico',
      error: graphQLError('Este carrito ya fue confirmado en otro pedido.', {
        code: 'CART_CONFIRMED',
      }),
      expected: 'Este carrito ya fue confirmado en otro pedido.',
    },
    {
      name: 'reemplaza mensajes técnicos por el texto del código',
      error: graphQLError('Forbidden', { code: 'FORBIDDEN' }),
      expected: 'No tenés permisos para realizar esta acción.',
    },
    {
      name: 'traduce un error de red',
      error: { networkError: { statusCode: 0 } },
      expected: NETWORK_ERROR_MESSAGE,
    },
    {
      name: 'cae al mensaje por defecto con errores desconocidos',
      error: new Error('boom'),
      expected: DEFAULT_API_ERROR_MESSAGE,
    },
    {
      name: 'no filtra un mensaje técnico interno',
      error: graphQLError('ECONNREFUSED 10.0.0.5'),
      expected: DEFAULT_API_ERROR_MESSAGE,
    },
  ])('$name', ({ error, expected }) => {
    expect(getApiErrorMessage(error)).toBe(expected)
  })

  it('usa el fallback indicado por la pantalla', () => {
    expect(getApiErrorMessage(new Error('boom'), 'No pudimos confirmar tu pedido.')).toBe(
      'No pudimos confirmar tu pedido.',
    )
  })
})
