import { fireEvent, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { renderWithProviders } from '@test/utils'
import { CategoryFormModal } from '../CategoryFormModal'
import { ConfigGroupFormModal } from '../ConfigGroupFormModal'
import { ConfigOptionFormModal } from '../ConfigOptionFormModal'
import { IngredientFormModal } from '../IngredientFormModal'
import { ParameterFormModal } from '../ParameterFormModal'
import { RecipeItemFormModal } from '../RecipeItemFormModal'

const submitButton = () => screen.getByText('Guardar').closest('button') as HTMLButtonElement

describe('form modals states', () => {
  it('calls onClose when the category modal is dismissed', async () => {
    const onClose = vi.fn()
    renderWithProviders(
      <CategoryFormModal
        category={null}
        isSubmitting={false}
        onClose={onClose}
        onSubmit={vi.fn()}
      />,
    )

    await userEvent.keyboard('{Escape}')

    expect(onClose).toHaveBeenCalled()
  })

  it('calls onClose when the recipe modal is dismissed', async () => {
    const onClose = vi.fn()
    renderWithProviders(
      <RecipeItemFormModal
        item={null}
        ingredients={[]}
        isSubmitting={false}
        onClose={onClose}
        onSubmit={vi.fn()}
      />,
    )

    await userEvent.keyboard('{Escape}')

    expect(onClose).toHaveBeenCalled()
  })

  it('disables submit while submitting for every modal', () => {
    const category = renderWithProviders(
      <CategoryFormModal
        category={{ id: 'c1', name: 'Hamburguesas', active: true }}
        isSubmitting
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />,
    )
    expect(submitButton()).toBeDisabled()
    category.unmount()

    const group = renderWithProviders(
      <ConfigGroupFormModal
        group={{
          id: 'g1',
          name: 'Tamaño',
          type: 'single',
          required: false,
          min: 0,
          max: 1,
          options: [],
        }}
        isSubmitting
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />,
    )
    expect(submitButton()).toBeDisabled()
    group.unmount()

    const option = renderWithProviders(
      <ConfigOptionFormModal
        option={{ id: 'o1', name: 'Doble', extraPrice: 150, available: true }}
        isSubmitting
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />,
    )
    expect(submitButton()).toBeDisabled()
    option.unmount()

    const ingredient = renderWithProviders(
      <IngredientFormModal
        ingredient={{ id: 'i1', name: 'Pan', unit: 'un', active: true }}
        isSubmitting
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />,
    )
    expect(submitButton()).toBeDisabled()
    ingredient.unmount()

    const parameter = renderWithProviders(
      <ParameterFormModal
        parameter={{ key: 'MAX_DISTANCE_KM', value: 5, unit: 'km' }}
        isSubmitting
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />,
    )
    expect(submitButton()).toBeDisabled()
    parameter.unmount()

    const recipe = renderWithProviders(
      <RecipeItemFormModal
        item={{ id: 'r1', ingredientId: 'i1', quantity: 2 }}
        ingredients={[{ id: 'i1', name: 'Pan', unit: 'un', active: true }]}
        isSubmitting
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />,
    )
    expect(submitButton()).toBeDisabled()
    recipe.unmount()
  })

  it('uses the expected default switch values', () => {
    const category = renderWithProviders(
      <CategoryFormModal
        category={null}
        isSubmitting={false}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />,
    )
    expect((screen.getByLabelText('Categoría activa') as HTMLLabelElement).control).toBeChecked()
    category.unmount()

    const ingredient = renderWithProviders(
      <IngredientFormModal
        ingredient={null}
        isSubmitting={false}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />,
    )
    expect((screen.getByLabelText('Ingrediente activo') as HTMLLabelElement).control).toBeChecked()
    ingredient.unmount()

    const option = renderWithProviders(
      <ConfigOptionFormModal
        option={null}
        isSubmitting={false}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />,
    )
    expect((screen.getByLabelText('Opción disponible') as HTMLLabelElement).control).toBeChecked()
    option.unmount()

    const group = renderWithProviders(
      <ConfigGroupFormModal
        group={null}
        isSubmitting={false}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />,
    )
    expect(
      (screen.getByLabelText('Grupo obligatorio') as HTMLLabelElement).control,
    ).not.toBeChecked()
    group.unmount()
  })

  it('rejects a negative min in the config group', async () => {
    renderWithProviders(
      <ConfigGroupFormModal
        group={null}
        isSubmitting={false}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />,
    )

    await userEvent.type(screen.getByPlaceholderText('Ej: Tamaño'), 'Extras')
    const min = screen.getByPlaceholderText('0')
    await userEvent.clear(min)
    await userEvent.type(min, '-1')
    await userEvent.tab()

    expect(await screen.findByText('Ingresá un entero mayor o igual a 0')).toBeInTheDocument()
    expect(submitButton()).toBeDisabled()
  })

  it('accepts zero as min and max in the config group', async () => {
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
    const max = screen.getByPlaceholderText('1')
    await userEvent.clear(max)
    await userEvent.type(max, '0')
    await userEvent.tab()
    await userEvent.click(submitButton())

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({
        name: 'Extras',
        type: 'single',
        required: false,
        min: 0,
        max: 0,
      }),
    )
  })

  it('requires an ingredient in the recipe item', async () => {
    renderWithProviders(
      <RecipeItemFormModal
        item={null}
        ingredients={[{ id: 'i1', name: 'Pan', unit: 'un', active: true }]}
        isSubmitting={false}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />,
    )

    await userEvent.type(screen.getByPlaceholderText('Ej: 1'), '2')
    const form = screen.getByText('Guardar').closest('form') as HTMLFormElement
    fireEvent.submit(form)

    expect(await screen.findByText('Seleccioná un ingrediente')).toBeInTheDocument()
    expect(submitButton()).toBeDisabled()
  })
})
