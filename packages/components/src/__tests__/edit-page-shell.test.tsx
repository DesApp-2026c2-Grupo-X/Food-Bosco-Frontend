import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderWithProviders } from '@test/utils'
import { EditPageShell } from '../EditPageShell'
import type { EditPageShellProps } from '../EditPageShell/types'

const baseProps: EditPageShellProps = {
  isNew: false,
  hasEntity: true,
  title: 'Editar producto',
  loadingTitle: 'Cargando producto...',
  notFound: { title: 'No encontrado', description: 'El producto no existe.' },
  children: <div>Contenido del formulario</div>,
}

describe('EditPageShell', () => {
  it('con isNew evita loading y not-found', () => {
    renderWithProviders(<EditPageShell {...baseProps} isNew isLoading hasEntity={false} />)

    expect(screen.getByText('Editar producto')).toBeInTheDocument()
    expect(screen.getByText('Contenido del formulario')).toBeInTheDocument()
    expect(screen.queryByText('Cargando producto...')).not.toBeInTheDocument()
    expect(screen.queryByText('No encontrado')).not.toBeInTheDocument()
  })

  it('muestra loadingTitle mientras carga', () => {
    renderWithProviders(<EditPageShell {...baseProps} isLoading />)

    expect(screen.getByText('Cargando producto...')).toBeInTheDocument()
    expect(screen.queryByText('Contenido del formulario')).not.toBeInTheDocument()
  })

  it('muestra el vacío cuando no existe la entidad', () => {
    renderWithProviders(<EditPageShell {...baseProps} hasEntity={false} />)

    expect(screen.getByText('No encontrado')).toBeInTheDocument()
    expect(screen.getByText('El producto no existe.')).toBeInTheDocument()
  })

  it('muestra el estado bloqueado solo cuando blocked.when', () => {
    const { unmount } = renderWithProviders(
      <EditPageShell
        {...baseProps}
        blocked={{ when: true, title: 'Bloqueado', description: 'No tenés permiso.' }}
      />,
    )
    expect(screen.getByText('Bloqueado')).toBeInTheDocument()
    expect(screen.queryByText('Contenido del formulario')).not.toBeInTheDocument()
    unmount()

    renderWithProviders(
      <EditPageShell
        {...baseProps}
        blocked={{ when: false, title: 'Bloqueado', description: 'No tenés permiso.' }}
      />,
    )
    expect(screen.queryByText('Bloqueado')).not.toBeInTheDocument()
    expect(screen.getByText('Contenido del formulario')).toBeInTheDocument()
  })

  it('renderiza el encabezado y los children en el flujo normal', () => {
    renderWithProviders(<EditPageShell {...baseProps} />)

    expect(screen.getByText('Editar producto')).toBeInTheDocument()
    expect(screen.getByText('Contenido del formulario')).toBeInTheDocument()
  })
})
