import { describe, expect, it } from 'vitest'
import { toBranchProduct } from '../branch'

describe('toBranchProduct', () => {
  it('nests the recipe with its ingredient and reads the category name', () => {
    const branchProduct = toBranchProduct({
      id: 'p1',
      name: 'Burger',
      price: '1200',
      category: { name: 'Comida' },
      available: 1,
      recipe: [
        {
          id: 'r1',
          ingredientId: 'i1',
          quantity: '2',
          ingredient: { id: 'i1', name: 'Pan', unit: 'un', active: true },
        },
      ],
    })

    expect(branchProduct.categoryName).toBe('Comida')
    expect(branchProduct.available).toBe(true)
    expect(branchProduct.product.recipe).toHaveLength(1)
    expect(branchProduct.product.recipe[0]?.ingredient).toMatchObject({ id: 'i1', name: 'Pan' })
  })

  it('falls back to "Sin categoría" and coerces availability', () => {
    const branchProduct = toBranchProduct({ available: 0 })

    expect(branchProduct.categoryName).toBe('Sin categoría')
    expect(branchProduct.available).toBe(false)
  })

  it('falls back to the product recipe when raw recipe is absent', () => {
    const branchProduct = toBranchProduct({ id: 'p1', name: 'Burger' })

    expect(branchProduct.product.recipe).toEqual([])
  })
})
