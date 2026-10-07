import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { describe, expect, it, vi } from 'vitest'
import type { z } from 'zod'
import { addressSchema } from '@repo/domain'
import type { AddressInput } from '@repo/domain'
import { AddressForm } from '../AddressForm'
import { renderWithProviders } from '@test/utils'

type AddressValues = z.infer<typeof addressSchema>

interface HarnessProps {
  submitting?: boolean
  error?: string | null
  heading?: string
  onSubmit: (values: AddressInput) => void | Promise<void>
}

const Harness = ({ submitting = false, error = null, heading, onSubmit }: HarnessProps) => {
  const form = useForm<AddressValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: { label: '', text: '', city: '', postalCode: '' },
    mode: 'onTouched',
    reValidateMode: 'onChange',
  })

  return (
    <AddressForm
      form={form}
      submitting={submitting}
      error={error}
      heading={heading}
      onSubmit={form.handleSubmit(onSubmit)}
    />
  )
}

const submit = () => screen.getByRole('button', { name: 'Guardar dirección' })

describe('AddressForm', () => {
  it('renders the heading and all address fields', () => {
    renderWithProviders(<Harness heading="Cargá tu dirección" onSubmit={vi.fn()} />)

    expect(screen.getByRole('heading', { name: 'Cargá tu dirección' })).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Casa, Facultad, Trabajo…')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Av. Ejemplo 123')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Hurlingham')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('1686')).toBeInTheDocument()
    expect(submit()).toBeDisabled()
  })

  it('shows the required error and blocks submission when the street is missing', async () => {
    const onSubmit = vi.fn()
    renderWithProviders(<Harness onSubmit={onSubmit} />)

    const street = screen.getByPlaceholderText('Av. Ejemplo 123')
    await userEvent.click(street)
    await userEvent.tab()

    expect(await screen.findByText('Este campo es requerido')).toBeInTheDocument()
    expect(submit()).toBeDisabled()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('submits the trimmed values when the form is valid', async () => {
    const onSubmit = vi.fn()
    renderWithProviders(<Harness onSubmit={onSubmit} />)

    await userEvent.type(screen.getByPlaceholderText('Av. Ejemplo 123'), 'Av. Siempreviva 742')
    await userEvent.type(screen.getByPlaceholderText('Hurlingham'), 'Springfield')
    await userEvent.tab()

    await waitFor(() => expect(submit()).toBeEnabled())
    await userEvent.click(submit())

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ text: 'Av. Siempreviva 742', city: 'Springfield' }),
        expect.anything(),
      ),
    )
  })

  it('surfaces a submission error and disables the button while submitting', () => {
    const { rerender } = renderWithProviders(
      <Harness error="No pudimos guardar la dirección." onSubmit={vi.fn()} />,
    )

    expect(screen.getByText('No pudimos guardar la dirección.')).toBeInTheDocument()

    rerender(<Harness submitting error="No pudimos guardar la dirección." onSubmit={vi.fn()} />)

    expect(screen.getByRole('button')).toBeDisabled()
  })
})
