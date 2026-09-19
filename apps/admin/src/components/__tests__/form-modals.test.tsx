import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { CategoryFormModal } from '../CategoryFormModal'
import { ConfigGroupFormModal } from '../ConfigGroupFormModal'
import { ConfigOptionFormModal } from '../ConfigOptionFormModal'
import { IngredientFormModal } from '../IngredientFormModal'
import { ParameterFormModal } from '../ParameterFormModal'
import { RecipeItemFormModal } from '../RecipeItemFormModal'
import { renderWithProviders } from '@test/utils'

const submitButton = () => screen.getByRole('button', { name: 'Guardar' })

describe('CategoryFormModal', () => {
  it('submits a trimmed name with the active flag', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    renderWithProviders(
      <CategoryFormModal
        category={null}
        isSubmitting={false}
        onClose={vi.fn()}
        onSubmit={onSubmit}
      />,
    )

    expect(submitButton()).toBeDisabled()

    await userEvent.type(screen.getByPlaceholderText('Ej: Hamburguesas'), '  Bebidas  ')
    await userEvent.tab()
    await userEvent.click(submitButton())

    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ name: 'Bebidas', active: true }))
  })

  it('toggles the active switch', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    renderWithProviders(
      <CategoryFormModal
        category={null}
        isSubmitting={false}
        onClose={vi.fn()}
        onSubmit={onSubmit}
      />,
    )

    await userEvent.type(screen.getByPlaceholderText('Ej: Hamburguesas'), 'Bebidas')
    await userEvent.tab()
    await userEvent.click(screen.getByLabelText('Categoría activa'))
    await userEvent.click(submitButton())

    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ name: 'Bebidas', active: false }))
  })

  it('blocks submission and shows the required error', async () => {
    const onSubmit = vi.fn()
    renderWithProviders(
      <CategoryFormModal
        category={null}
        isSubmitting={false}
        onClose={vi.fn()}
        onSubmit={onSubmit}
      />,
    )

    const name = screen.getByPlaceholderText('Ej: Hamburguesas')
    await userEvent.type(name, 'x')
    await userEvent.clear(name)
    await userEvent.tab()

    expect(await screen.findByText('Este campo es requerido')).toBeInTheDocument()
    expect(submitButton()).toBeDisabled()
    expect(onSubmit).not.toHaveBeenCalled()
  })
})

describe('ConfigGroupFormModal', () => {
  it('maps the type and numbers in the payload', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    renderWithProviders(
      <ConfigGroupFormModal
        group={null}
        isSubmitting={false}
        onClose={vi.fn()}
        onSubmit={onSubmit}
      />,
    )

    await userEvent.type(screen.getByPlaceholderText('Ej: Tamaño'), 'Extras')
    await userEvent.selectOptions(screen.getByRole('combobox'), 'multiple')
    await userEvent.click(screen.getByLabelText('Grupo obligatorio'))
    await userEvent.clear(screen.getByPlaceholderText('0'))
    await userEvent.type(screen.getByPlaceholderText('0'), '1')
    await userEvent.clear(screen.getByPlaceholderText('1'))
    await userEvent.type(screen.getByPlaceholderText('1'), '3')
    await userEvent.click(submitButton())

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({
        name: 'Extras',
        type: 'multiple',
        required: true,
        min: 1,
        max: 3,
      }),
    )
  })

  it('rejects a maximum below the minimum', async () => {
    const onSubmit = vi.fn()
    renderWithProviders(
      <ConfigGroupFormModal
        group={null}
        isSubmitting={false}
        onClose={vi.fn()}
        onSubmit={onSubmit}
      />,
    )

    await userEvent.type(screen.getByPlaceholderText('Ej: Tamaño'), 'Extras')
    await userEvent.clear(screen.getByPlaceholderText('0'))
    await userEvent.type(screen.getByPlaceholderText('0'), '2')
    await userEvent.clear(screen.getByPlaceholderText('1'))
    await userEvent.type(screen.getByPlaceholderText('1'), '1')
    await userEvent.tab()

    expect(
      await screen.findByText('El máximo no puede ser menor que el mínimo'),
    ).toBeInTheDocument()
    expect(submitButton()).toBeDisabled()
  })
})

describe('ConfigOptionFormModal', () => {
  it('submits the numeric price variation and availability', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    renderWithProviders(
      <ConfigOptionFormModal
        option={null}
        isSubmitting={false}
        onClose={vi.fn()}
        onSubmit={onSubmit}
      />,
    )

    await userEvent.type(screen.getByPlaceholderText('Ej: Doble'), 'Queso')
    await userEvent.clear(screen.getByPlaceholderText('0'))
    await userEvent.type(screen.getByPlaceholderText('0'), '150')
    await userEvent.tab()
    await userEvent.click(submitButton())

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({ name: 'Queso', extraPrice: 150, available: true }),
    )
  })
})

describe('IngredientFormModal', () => {
  it('submits name, unit and active flag', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    renderWithProviders(
      <IngredientFormModal
        ingredient={null}
        isSubmitting={false}
        onClose={vi.fn()}
        onSubmit={onSubmit}
      />,
    )

    await userEvent.type(screen.getByPlaceholderText('Ej: Pan de hamburguesa'), ' Pan ')
    await userEvent.type(screen.getByPlaceholderText('Ej: un, kg, l'), ' un ')
    await userEvent.tab()
    await userEvent.click(submitButton())

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({ name: 'Pan', unit: 'un', active: true }),
    )
  })
})

describe('ParameterFormModal', () => {
  it('submits a numeric value', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    renderWithProviders(
      <ParameterFormModal
        parameter={{ key: 'delivery_fee', value: 250, unit: 'ARS' }}
        isSubmitting={false}
        onClose={vi.fn()}
        onSubmit={onSubmit}
      />,
    )

    await userEvent.clear(screen.getByPlaceholderText('Ej: 10'))
    await userEvent.type(screen.getByPlaceholderText('Ej: 10'), '300')
    await userEvent.tab()
    await userEvent.click(submitButton())

    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith(300))
  })

  it('rejects zero values', async () => {
    const onSubmit = vi.fn()
    renderWithProviders(
      <ParameterFormModal
        parameter={null}
        isSubmitting={false}
        onClose={vi.fn()}
        onSubmit={onSubmit}
      />,
    )

    await userEvent.type(screen.getByPlaceholderText('Ej: 10'), '0')
    await userEvent.tab()

    expect(await screen.findByText('El valor debe ser mayor a 0')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })
})

describe('RecipeItemFormModal', () => {
  it('submits the chosen ingredient and numeric quantity', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    renderWithProviders(
      <RecipeItemFormModal
        item={null}
        ingredients={[{ id: 'i1', name: 'Pan', unit: 'un', active: true }]}
        isSubmitting={false}
        onClose={vi.fn()}
        onSubmit={onSubmit}
      />,
    )

    await userEvent.selectOptions(screen.getByRole('combobox'), 'i1')
    await userEvent.type(screen.getByPlaceholderText('Ej: 1'), '2')
    await userEvent.tab()
    await userEvent.click(submitButton())

    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ ingredientId: 'i1', quantity: 2 }))
  })

  it('requires a quantity greater than zero', async () => {
    const onSubmit = vi.fn()
    renderWithProviders(
      <RecipeItemFormModal
        item={null}
        ingredients={[{ id: 'i1', name: 'Pan', unit: 'un', active: true }]}
        isSubmitting={false}
        onClose={vi.fn()}
        onSubmit={onSubmit}
      />,
    )

    await userEvent.selectOptions(screen.getByRole('combobox'), 'i1')
    await userEvent.type(screen.getByPlaceholderText('Ej: 1'), '0')
    await userEvent.tab()

    expect(await screen.findByText('La cantidad debe ser mayor a 0')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })
})
