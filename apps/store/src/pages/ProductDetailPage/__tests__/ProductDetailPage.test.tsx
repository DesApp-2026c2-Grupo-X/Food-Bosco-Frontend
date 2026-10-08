import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Route, Routes } from 'react-router-dom'
import { ProductDetailPage } from '../index'
import { createTestClient, operationVariables } from '@test/apollo'
import { renderWithProviders } from '@test/utils'

const { notifySuccess, notifyError } = vi.hoisted(() => ({
  notifySuccess: vi.fn(),
  notifyError: vi.fn(),
}))

vi.mock('@repo/components', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@repo/components')>()),
  notifySuccess,
  notifyError,
}))

const rawProduct = {
  id: 'p1',
  categoryId: 'c1',
  name: 'Burger',
  description: 'Rica',
  price: 1000,
  image: null,
  available: true,
  configGroups: [
    {
      id: 'g1',
      name: 'Tamaño',
      type: 'SINGLE',
      required: true,
      min: 1,
      max: 1,
      options: [
        { id: 'o1', name: 'Grande', extraPrice: 200, available: true },
        { id: 'o4', name: 'Chica', extraPrice: 50, available: true },
      ],
    },
    {
      id: 'g2',
      name: 'Extras',
      type: 'MULTIPLE',
      required: false,
      min: 0,
      max: 3,
      options: [
        { id: 'o2', name: 'Queso', extraPrice: 150, available: true },
        { id: 'o3', name: 'Bacon', extraPrice: 250, available: true },
      ],
    },
  ],
  recipe: [],
}

const deferred = <T,>() => {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((res) => {
    resolve = res
  })
  return { promise, resolve }
}

const setup = (options: { product?: unknown; productLoading?: boolean; addError?: Error } = {}) => {
  const pendingProduct = deferred<{ data: { product: typeof rawProduct | null } }>()
  const client = createTestClient((operation) => {
    switch (operation.operationName) {
      case 'Product':
        if (options.productLoading) return pendingProduct.promise
        return { data: { product: options.product === undefined ? rawProduct : options.product } }
      case 'MyCart':
        return {
          data: { myCart: { id: 'cart', clientId: 'c1', status: 'OPEN', total: 0, items: [] } },
        }
      case 'AddCartItem':
        if (options.addError) return options.addError
        return { data: {} }
      default:
        return { data: {} }
    }
  })

  const rendered = renderWithProviders(
    <Routes>
      <Route path="/products/:productId" element={<ProductDetailPage />} />
      <Route path="/cart" element={<div>Cart probe</div>} />
      <Route path="/catalog" element={<div>Catalog probe</div>} />
    </Routes>,
    { client: client.client, route: '/products/p1' },
  )

  return { client, pendingProduct, ...rendered }
}

const option = (name: RegExp) => screen.getByRole('button', { name })
const addButton = () => screen.getByRole('button', { name: 'Agregar al carrito' })
const notesField = () => screen.getByPlaceholderText('Sin cebolla, extra salsa, etc.')

describe('ProductDetailPage', () => {
  it('shows a loading skeleton before the product arrives', async () => {
    const { pendingProduct } = setup({ productLoading: true })

    expect(screen.queryByText('Burger')).not.toBeInTheDocument()
    expect(document.querySelectorAll('.chakra-skeleton').length).toBeGreaterThan(0)

    pendingProduct.resolve({ data: { product: rawProduct } })

    expect(await screen.findByText('Burger')).toBeInTheDocument()
  })

  it('replaces the selection within a single-option group', async () => {
    setup()
    await screen.findByText('Burger')

    await userEvent.click(option(/Grande/))
    expect(await screen.findByText(/1\.200/)).toBeInTheDocument()

    await userEvent.click(option(/Chica/))
    await waitFor(() => expect(screen.getByText(/1\.050/)).toBeInTheDocument())
    expect(screen.queryByText(/1\.200/)).not.toBeInTheDocument()
  })

  it('toggles multiple options on and off', async () => {
    setup()
    await screen.findByText('Burger')

    await userEvent.click(option(/Queso/))
    expect(await screen.findByText(/1\.150/)).toBeInTheDocument()

    await userEvent.click(option(/Bacon/))
    expect(await screen.findByText(/1\.400/)).toBeInTheDocument()

    await userEvent.click(option(/Queso/))
    expect(await screen.findByText(/1\.250/)).toBeInTheDocument()
  })

  it('updates the total through the quantity stepper', async () => {
    setup()
    await screen.findByText('Burger')

    await userEvent.click(screen.getByRole('button', { name: 'Agregar uno' }))

    expect(await screen.findByText(/2\.000/)).toBeInTheDocument()
  })

  it('captures observations', async () => {
    setup()
    await screen.findByText('Burger')

    await userEvent.type(notesField(), 'sin sal')

    expect(notesField()).toHaveValue('sin sal')
  })

  it('adds the configured product and navigates to the cart', async () => {
    const { client } = setup()
    await screen.findByText('Burger')

    await userEvent.click(option(/Grande/))
    await userEvent.type(notesField(), 'sin sal')
    await userEvent.click(addButton())

    expect(await screen.findByText('Cart probe')).toBeInTheDocument()
    expect(operationVariables(client.lastRequest('AddCartItem'))?.input).toEqual({
      productId: 'p1',
      quantity: 1,
      observations: 'sin sal',
      optionIds: ['o1'],
    })
    expect(notifySuccess).toHaveBeenCalled()
  })

  it('shows an inline error and stays on the page when adding fails', async () => {
    setup({ addError: new Error('boom') })
    await screen.findByText('Burger')

    await userEvent.click(option(/Grande/))
    await userEvent.click(addButton())

    expect(
      await screen.findByText('No pudimos agregar el producto. Intentá de nuevo.'),
    ).toBeInTheDocument()
    expect(screen.queryByText('Cart probe')).not.toBeInTheDocument()
    expect(screen.getByText('Burger')).toBeInTheDocument()
    expect(notifyError).toHaveBeenCalled()
  })

  it('shows a not-found state when the product does not exist', async () => {
    setup({ product: null })

    expect(await screen.findByText('Producto no encontrado')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Volver al catálogo' })).toHaveAttribute(
      'href',
      '/catalog',
    )
  })
})
