import { useState } from 'react'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { FormProvider, useForm, type FieldValues, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ImageUploadField } from '../ImageUploadField'
import { FormImageField } from '../FormImageField'
import { renderWithProviders } from '@test/utils'

const imageFile = () => new File(['image'], 'foto.png', { type: 'image/png' })

const fileInput = (container: HTMLElement) =>
  container.querySelector('input[type="file"]') as HTMLInputElement

const upload = async (container: HTMLElement) => {
  fireEvent.input(fileInput(container), { target: { files: [imageFile()] } })
}

describe('ImageUploadField', () => {
  it('calls onChange with the uploaded URL', async () => {
    const onUpload = vi.fn().mockResolvedValue('https://cdn/foto.png')
    const onChange = vi.fn()
    const { container } = renderWithProviders(
      <ImageUploadField label="Foto" value="" onUpload={onUpload} onChange={onChange} />,
    )

    await upload(container)

    await waitFor(() => expect(onUpload).toHaveBeenCalledTimes(1))
    await waitFor(() => expect(onChange).toHaveBeenCalledWith('https://cdn/foto.png'))
  })

  it('shows an error when the upload resolves to a falsy URL', async () => {
    const onUpload = vi.fn().mockResolvedValue('')
    const { container } = renderWithProviders(
      <ImageUploadField label="Foto" value="" onUpload={onUpload} onChange={vi.fn()} />,
    )

    await upload(container)

    expect(await screen.findByText('No se pudo subir la imagen.')).toBeInTheDocument()
  })

  it('shows the thrown error message', async () => {
    const onUpload = vi.fn().mockRejectedValue(new Error('Servidor caído'))
    const { container } = renderWithProviders(
      <ImageUploadField label="Foto" value="" onUpload={onUpload} onChange={vi.fn()} />,
    )

    await upload(container)

    expect(await screen.findByText('Servidor caído')).toBeInTheDocument()
  })

  it('clears the value', async () => {
    const onChange = vi.fn()
    renderWithProviders(
      <ImageUploadField
        label="Foto"
        value="https://cdn/foto.png"
        onUpload={vi.fn()}
        onChange={onChange}
      />,
    )

    expect(screen.getByAltText('Foto')).toHaveAttribute('src', 'https://cdn/foto.png')
    expect(screen.getByRole('button', { name: 'Cambiar imagen' })).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Quitar' }))
    expect(onChange).toHaveBeenCalledWith('')
  })

  it('disables the actions and shows the overlay while uploading', () => {
    const { container } = renderWithProviders(
      <ImageUploadField label="Foto" value="https://cdn/foto.png" onUpload={vi.fn()} isUploading />,
    )

    expect(screen.getByRole('button', { name: 'Cambiar imagen' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Quitar' })).toBeDisabled()
    expect(container.querySelector('.chakra-spinner')).not.toBeNull()
  })

  it('edits the value through the URL input', async () => {
    const ImageDemo = () => {
      const [value, setValue] = useState('')
      return <ImageUploadField label="Foto" value={value} onUpload={vi.fn()} onChange={setValue} />
    }
    renderWithProviders(<ImageDemo />)

    const url = screen.getByLabelText('URL de imagen')
    await userEvent.type(url, 'https://x/y.png')
    expect(url).toHaveValue('https://x/y.png')
  })
})

describe('FormImageField', () => {
  const schema = z.object({ image: z.string().min(1, 'Requerido') })

  const FormImageHarness = ({ onSubmit }: { onSubmit: (values: FieldValues) => void }) => {
    const form = useForm<FieldValues>({
      resolver: zodResolver(schema) as unknown as Resolver<FieldValues>,
      defaultValues: { image: '' },
      mode: 'onTouched',
    })

    return (
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit((values) => onSubmit(values))}>
          <FormImageField name="image" label="Foto" onUpload={vi.fn()} />
          <button type="submit">Enviar</button>
        </form>
      </FormProvider>
    )
  }

  it('binds the URL input to the form value', async () => {
    const onSubmit = vi.fn()
    renderWithProviders(<FormImageHarness onSubmit={onSubmit} />)

    await userEvent.type(screen.getByLabelText('URL de imagen'), 'https://x/y.png')
    expect(screen.getByLabelText('URL de imagen')).toHaveValue('https://x/y.png')

    await userEvent.click(screen.getByRole('button', { name: 'Enviar' }))
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ image: 'https://x/y.png' }))
  })
})
