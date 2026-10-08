import { describe, expect, it, vi } from 'vitest'
import { notifyError, notifySuccess, toaster } from '../Toaster/toaster'

describe('toaster helpers', () => {
  it('notifySuccess creates a success toast', () => {
    const create = vi.spyOn(toaster, 'create')

    notifySuccess({ title: 'Listo', description: 'Todo salió bien' })

    expect(create).toHaveBeenCalledWith({
      type: 'success',
      title: 'Listo',
      description: 'Todo salió bien',
    })
  })

  it('notifyError creates an error toast', () => {
    const create = vi.spyOn(toaster, 'create')

    notifyError({ title: 'Error' })

    expect(create).toHaveBeenCalledWith({
      type: 'error',
      title: 'Error',
      description: undefined,
    })
  })
})
