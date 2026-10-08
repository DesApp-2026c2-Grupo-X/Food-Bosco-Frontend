import { screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { renderWithProviders } from '@test/utils'
import { CategoryFormModal } from '../CategoryFormModal'
import { ConfigGroupFormModal } from '../ConfigGroupFormModal'
import { ConfigOptionFormModal } from '../ConfigOptionFormModal'
import { IngredientFormModal } from '../IngredientFormModal'
import { ParameterFormModal } from '../ParameterFormModal'
import { RecipeItemFormModal } from '../RecipeItemFormModal'

describe('form modals edit mode', () => {
  it('prefills the category and uses the edit title', () => {
    renderWithProviders(
      <CategoryFormModal
        category={{ id: 'c1', name: 'Hamburguesas', active: false }}
        isSubmitting={false}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />,
    )

    expect(screen.getByText('Editar categoría')).toBeInTheDocument()
    expect(screen.getByLabelText('Nombre')).toHaveValue('Hamburguesas')
    const active = screen.getByLabelText('Categoría activa') as HTMLLabelElement
    expect(active.control).not.toBeChecked()
  })

  it('prefills the config group and uses the edit title', () => {
    renderWithProviders(
      <ConfigGroupFormModal
        group={{
          id: 'g1',
          name: 'Tamaño',
          type: 'multiple',
          required: true,
          min: 1,
          max: 3,
          options: [],
        }}
        isSubmitting={false}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />,
    )

    expect(screen.getByText('Editar grupo')).toBeInTheDocument()
    expect(screen.getByLabelText('Nombre')).toHaveValue('Tamaño')
    expect(screen.getByLabelText('Tipo de selección')).toHaveValue('multiple')
    const required = screen.getByLabelText('Grupo obligatorio') as HTMLLabelElement
    expect(required.control).toBeChecked()
    expect(screen.getByLabelText('Mínimo')).toHaveValue('1')
    expect(screen.getByLabelText('Máximo')).toHaveValue('3')
  })

  it('prefills the config option and uses the edit title', () => {
    renderWithProviders(
      <ConfigOptionFormModal
        option={{ id: 'o1', name: 'Doble', extraPrice: 150, available: false }}
        isSubmitting={false}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />,
    )

    expect(screen.getByText('Editar opción')).toBeInTheDocument()
    expect(screen.getByLabelText('Nombre')).toHaveValue('Doble')
    expect(screen.getByLabelText('Variación de precio')).toHaveValue('150')
    const available = screen.getByLabelText('Opción disponible') as HTMLLabelElement
    expect(available.control).not.toBeChecked()
  })

  it('prefills the ingredient and uses the edit title', () => {
    renderWithProviders(
      <IngredientFormModal
        ingredient={{ id: 'i1', name: 'Pan', unit: 'un', active: false }}
        isSubmitting={false}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />,
    )

    expect(screen.getByText('Editar ingrediente')).toBeInTheDocument()
    expect(screen.getByLabelText('Nombre')).toHaveValue('Pan')
    expect(screen.getByLabelText('Unidad')).toHaveValue('un')
    const active = screen.getByLabelText('Ingrediente activo') as HTMLLabelElement
    expect(active.control).not.toBeChecked()
  })

  it('prefills the parameter with value and subtitle', () => {
    renderWithProviders(
      <ParameterFormModal
        parameter={{ key: 'MAX_DISTANCE_KM', value: 5, unit: 'km' }}
        isSubmitting={false}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />,
    )

    expect(screen.getByText('Editar parámetro')).toBeInTheDocument()
    expect(screen.getByLabelText('Valor')).toHaveValue('5')
    expect(screen.getByText(/MAX_DISTANCE_KM · km/)).toBeInTheDocument()
  })

  it('prefills the recipe item and uses the edit title', () => {
    renderWithProviders(
      <RecipeItemFormModal
        item={{ id: 'r1', ingredientId: 'i1', quantity: 2 }}
        ingredients={[{ id: 'i1', name: 'Pan', unit: 'un', active: true }]}
        isSubmitting={false}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />,
    )

    expect(screen.getByText('Editar ingrediente')).toBeInTheDocument()
    expect(screen.getByLabelText('Ingrediente')).toHaveValue('i1')
    expect(screen.getByLabelText('Cantidad')).toHaveValue('2')
  })
})
