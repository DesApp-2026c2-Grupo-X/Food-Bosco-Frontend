import { useState, type ReactNode } from 'react'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { FormProvider, useForm, type FieldValues, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { TextField } from '../TextField'
import { TextAreaField } from '../TextAreaField'
import { FieldShell } from '../FieldShell'
import { FormField } from '../FormField'
import { FormPasswordField } from '../FormPasswordField'
import { FormTextAreaField } from '../FormTextAreaField'
import { FormSelectField } from '../FormSelectField'
import { renderWithProviders } from '@test/utils'

interface HarnessProps {
  children: ReactNode
  schema: z.ZodType<unknown, FieldValues>
  defaultValues: FieldValues
  onSubmit: (values: FieldValues) => void
}

const FormHarness = ({ children, schema, defaultValues, onSubmit }: HarnessProps) => {
  const form = useForm<FieldValues>({
    resolver: zodResolver(schema) as Resolver<FieldValues>,
    defaultValues,
    mode: 'onTouched',
  })

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit((values) => onSubmit(values))}>
        {children}
        <button type="submit">Enviar</button>
      </form>
    </FormProvider>
  )
}

const nameSchema = z.object({ name: z.string().min(1, 'Requerido') })
const providerSchema = z.object({ provider: z.string().min(1, 'Requerido') })

const TextFieldDemo = ({ onBlur }: { onBlur?: () => void }) => {
  const [value, setValue] = useState('')
  return (
    <TextField
      label="Nombre"
      placeholder="Nombre"
      value={value}
      onChange={(event) => setValue(event.target.value)}
      onBlur={onBlur}
    />
  )
}

const TextAreaFieldDemo = () => {
  const [value, setValue] = useState('')
  return (
    <TextAreaField
      label="Descripción"
      placeholder="Descripción"
      value={value}
      onChange={(event) => setValue(event.target.value)}
    />
  )
}

describe('TextField', () => {
  it('binds value, onChange and onBlur', async () => {
    const onBlur = vi.fn()
    renderWithProviders(<TextFieldDemo onBlur={onBlur} />)

    const input = screen.getByPlaceholderText('Nombre')
    await userEvent.type(input, 'Ana')
    expect(input).toHaveValue('Ana')

    await userEvent.tab()
    expect(onBlur).toHaveBeenCalled()
  })

  it('renders the error text only when invalid', () => {
    const { rerender } = renderWithProviders(
      <TextField label="Nombre" placeholder="Nombre" value="" onChange={vi.fn()} />,
    )
    expect(screen.queryByText('Requerido')).not.toBeInTheDocument()

    rerender(
      <TextField
        label="Nombre"
        placeholder="Nombre"
        value=""
        onChange={vi.fn()}
        invalid
        errorText="Requerido"
      />,
    )
    expect(screen.getByText('Requerido')).toBeInTheDocument()
  })
})

describe('TextAreaField', () => {
  it('binds value and onChange', async () => {
    renderWithProviders(<TextAreaFieldDemo />)

    const textarea = screen.getByPlaceholderText('Descripción')
    await userEvent.type(textarea, 'Rica')
    expect(textarea).toHaveValue('Rica')
  })
})

describe('FieldShell', () => {
  it('marks the label as required and shows the error', () => {
    renderWithProviders(
      <FieldShell label="Nombre" required invalid errorText="Requerido">
        <input />
      </FieldShell>,
    )

    expect(screen.getByText('Nombre')).toHaveAttribute('data-required')
    expect(screen.getByText('Requerido')).toBeInTheDocument()
  })

  it('omits the required marker and error when not requested', () => {
    renderWithProviders(
      <FieldShell label="Nombre">
        <input />
      </FieldShell>,
    )

    expect(screen.getByText('Nombre')).not.toHaveAttribute('data-required')
    expect(screen.queryByText('Requerido')).not.toBeInTheDocument()
  })
})

describe('FormField', () => {
  it('binds the input through the form and submits the value', async () => {
    const onSubmit = vi.fn()
    renderWithProviders(
      <FormHarness schema={nameSchema} defaultValues={{ name: '' }} onSubmit={onSubmit}>
        <FormField name="name" label="Nombre" required placeholder="Nombre" />
      </FormHarness>,
    )

    const input = screen.getByPlaceholderText('Nombre')
    await userEvent.type(input, 'Ana')
    expect(input).toHaveValue('Ana')
    expect(screen.getByText('Nombre')).toHaveAttribute('data-required')

    await userEvent.click(screen.getByRole('button', { name: 'Enviar' }))
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ name: 'Ana' }))
  })

  it('shows the field error and blocks submit when invalid', async () => {
    const onSubmit = vi.fn()
    renderWithProviders(
      <FormHarness schema={nameSchema} defaultValues={{ name: '' }} onSubmit={onSubmit}>
        <FormField name="name" label="Nombre" placeholder="Nombre" />
      </FormHarness>,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Enviar' }))
    expect(await screen.findByText('Requerido')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })
})

describe('FormPasswordField', () => {
  it('binds a password input through the form', async () => {
    const onSubmit = vi.fn()
    renderWithProviders(
      <FormHarness schema={nameSchema} defaultValues={{ name: '' }} onSubmit={onSubmit}>
        <FormPasswordField name="name" label="Contraseña" placeholder="Contraseña" />
      </FormHarness>,
    )

    const input = screen.getByPlaceholderText('Contraseña')
    expect(input).toHaveAttribute('type', 'password')

    await userEvent.type(input, 'secreto')
    await userEvent.click(screen.getByRole('button', { name: 'Enviar' }))
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ name: 'secreto' }))
  })
})

describe('FormTextAreaField', () => {
  it('binds a textarea through the form', async () => {
    const onSubmit = vi.fn()
    renderWithProviders(
      <FormHarness schema={nameSchema} defaultValues={{ name: '' }} onSubmit={onSubmit}>
        <FormTextAreaField name="name" label="Descripción" placeholder="Descripción" />
      </FormHarness>,
    )

    await userEvent.type(screen.getByPlaceholderText('Descripción'), 'Rica')
    await userEvent.click(screen.getByRole('button', { name: 'Enviar' }))
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ name: 'Rica' }))
  })
})

describe('FormSelectField', () => {
  const options = [
    { value: 'a', label: 'Opción A' },
    { value: 'b', label: 'Opción B' },
  ]

  it('renders the placeholder as a disabled empty option and the available options', () => {
    renderWithProviders(
      <FormHarness schema={providerSchema} defaultValues={{ provider: '' }} onSubmit={vi.fn()}>
        <FormSelectField name="provider" label="Proveedor" placeholder="Elegí" options={options} />
      </FormHarness>,
    )

    const placeholder = screen.getByRole('option', { name: 'Elegí' })
    expect(placeholder).toBeDisabled()
    expect(placeholder).toHaveValue('')
    expect(screen.getByRole('option', { name: 'Opción A' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Opción B' })).toBeInTheDocument()
  })

  it('reports the selected value and submits it', async () => {
    const onSubmit = vi.fn()
    renderWithProviders(
      <FormHarness schema={providerSchema} defaultValues={{ provider: '' }} onSubmit={onSubmit}>
        <FormSelectField name="provider" label="Proveedor" placeholder="Elegí" options={options} />
      </FormHarness>,
    )

    const select = screen.getByRole('combobox')
    await userEvent.selectOptions(select, 'b')
    expect(select).toHaveValue('b')

    await userEvent.click(screen.getByRole('button', { name: 'Enviar' }))
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ provider: 'b' }))
  })

  it('disables the select when requested', () => {
    renderWithProviders(
      <FormHarness schema={providerSchema} defaultValues={{ provider: '' }} onSubmit={vi.fn()}>
        <FormSelectField name="provider" label="Proveedor" options={options} disabled />
      </FormHarness>,
    )

    expect(screen.getByRole('combobox')).toBeDisabled()
  })

  it('applies the given width to the select root', () => {
    renderWithProviders(
      <FormHarness schema={providerSchema} defaultValues={{ provider: '' }} onSubmit={vi.fn()}>
        <FormSelectField name="provider" label="Proveedor" options={options} width="200px" />
      </FormHarness>,
    )

    const select = screen.getByRole('combobox')
    const root = select.closest('div') as HTMLElement
    expect(window.getComputedStyle(root).width).toBe('200px')
  })
})
