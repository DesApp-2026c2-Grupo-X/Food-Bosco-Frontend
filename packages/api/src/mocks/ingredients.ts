import type { Ingredient } from '@repo/domain'

export const MOCK_INGREDIENTS: Ingredient[] = [
  { id: 1, name: 'Pan de hamburguesa', unit: 'un', active: true },
  { id: 2, name: 'Medallón de carne', unit: 'un', active: true },
  { id: 3, name: 'Feta de queso', unit: 'un', active: true },
  { id: 4, name: 'Lechuga', unit: 'un', active: true },
  { id: 5, name: 'Tomate', unit: 'un', active: true },
  { id: 6, name: 'Masa de pizza', unit: 'un', active: true },
  { id: 7, name: 'Muzzarella', unit: 'g', active: true },
  { id: 8, name: 'Salsa de tomate', unit: 'g', active: true },
  { id: 9, name: 'Papa', unit: 'kg', active: true },
  { id: 10, name: 'Bebida cola', unit: 'botella', active: true },
  { id: 11, name: 'Helado', unit: 'un', active: true },
  { id: 12, name: 'Leche', unit: 'l', active: true },
]

export const getIngredientById = (id: number): Ingredient | null =>
  MOCK_INGREDIENTS.find((ingredient) => ingredient.id === id) ?? null
