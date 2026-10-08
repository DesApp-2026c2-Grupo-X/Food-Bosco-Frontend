import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { useForm, type FieldValues, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FormModal } from '../FormModal'
import { FormField } from '../FormField'
import { renderWithProviders } from '@test/utils'

const schema = z.object({ name: z.string().min(1, 'Requerido') })

interface HostProps {
  onSubmit: (values: FieldValues) => Promise<void> | void
  submitLabel?: string
  isSubmitting?: boolean
  onClose?: () => void
}

const FormModalHost = ({ onSubmit, submitLabel, isSubmitting, onClose = vi.fn() }: HostProps) => {
  const form = useForm<FieldValues>({
    resolver: zodResolver(schema) as unknown as Resolver<FieldValues>,
    defaultValues: { name: '' },
    mode: 'onTouched',
  })

  return (
    <FormModal
      open
      onClose={onClose}
      title="Nuevo producto"
      form={form}
      onSubmit={(values) => onSubmit(values)}
      submitLabel={submitLabel}
      isSubmitting={isSubmitting}
    >
      <FormField name="name" label="Nombre" required placeholder="Nombre" />
    </FormModal>
  )
}

const submitButton = (name = 'Guardar') => screen.getByRole('button', { name })

describe('FormModal', () => {
  it('renders the title and fields with submit disabled while invalid', async () => {
    renderWithProviders(<FormModalHost onSubmit={vi.fn()} />)

    expect(screen.getByRole('heading', { name: 'Nuevo producto' })).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Nombre')).toBeInTheDocument()
    expect(submitButton()).toBeDisabled()

    await userEvent.type(screen.getByPlaceholderText('Nombre'), 'Ana')
    await userEvent.tab()
    expect(submitButton()).toBeEnabled()
  })

  it('submits the form values', async () => {
    const onSubmit = vi.fn()
    renderWithProviders(<FormModalHost onSubmit={onSubmit} />)

    await userEvent.type(screen.getByPlaceholderText('Nombre'), 'Ana')
    await userEvent.tab()
    await userEvent.click(submitButton())

    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ name: 'Ana' }))
  })

  it('uses a custom submit label', () => {
    renderWithProviders(<FormModalHost onSubmit={vi.fn()} submitLabel="Crear" />)

    expect(submitButton('Crear')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Guardar' })).not.toBeInTheDocument()
  })

  it('shows the loading state and disables the submit while submitting', async () => {
    renderWithProviders(<FormModalHost onSubmit={vi.fn()} isSubmitting />)

    const button = document.querySelector('button[type="submit"]') as HTMLButtonElement
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('data-loading')
  })
})
