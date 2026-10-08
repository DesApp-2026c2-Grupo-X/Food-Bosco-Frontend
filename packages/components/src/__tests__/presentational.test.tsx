import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { PageHeader } from '../PageHeader'
import { SectionHeader } from '../SectionHeader'
import { PageContainer } from '../PageContainer'
import { WidePageContainer } from '../WidePageContainer'
import { HeaderActionsBar } from '../HeaderActionsBar'
import { Card } from '../Card'
import {
  GhostButton,
  InverseButton,
  OutlineButton,
  PrimaryButton,
  SecondaryButton,
} from '../Button'
import { Footer } from '../Footer'
import { Eyebrow, Lead, Muted, PageTitle, Price, SectionTitle, Strong, Subtle } from '../typography'
import { Logo } from '../Logo'
import { createLogo } from '../createLogo'
import { BackButton } from '../BackButton'
import { FormLayout } from '../FormLayout'
import { FormActions } from '../FormActions'
import { SearchInput } from '../SearchInput'
import { renderWithProviders } from '@test/utils'

describe('PageHeader', () => {
  it('renders the title, description and action', () => {
    renderWithProviders(
      <PageHeader
        title="Pedidos"
        description="Todos los pedidos"
        action={<button>Nuevo</button>}
      />,
    )

    expect(screen.getByRole('heading', { level: 1, name: 'Pedidos' })).toBeInTheDocument()
    expect(screen.getByText('Todos los pedidos')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Nuevo' })).toBeInTheDocument()
  })

  it('omits the description when absent', () => {
    renderWithProviders(<PageHeader title="Pedidos" />)

    expect(screen.queryByText('Todos los pedidos')).not.toBeInTheDocument()
  })
})

describe('SectionHeader', () => {
  it('renders the label, title and action', () => {
    renderWithProviders(
      <SectionHeader label="Resumen" title="Top productos" action={<button>Ver</button>} />,
    )

    expect(screen.getByText('Resumen')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Top productos' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Ver' })).toBeInTheDocument()
  })
})

describe('PageContainer', () => {
  it('renders its children', () => {
    renderWithProviders(
      <PageContainer>
        <div>contenido</div>
      </PageContainer>,
    )

    expect(screen.getByText('contenido')).toBeInTheDocument()
  })
})

describe('WidePageContainer', () => {
  it('renders its children', () => {
    renderWithProviders(
      <WidePageContainer>
        <div>contenido ancho</div>
      </WidePageContainer>,
    )

    expect(screen.getByText('contenido ancho')).toBeInTheDocument()
  })
})

describe('HeaderActionsBar', () => {
  it('renders children, theme toggle and profile link', () => {
    renderWithProviders(
      <HeaderActionsBar profilePath="/profile">
        <button>Acción</button>
      </HeaderActionsBar>,
    )

    expect(screen.getByRole('button', { name: 'Acción' })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Cambiar a modo oscuro', hidden: true }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Perfil', hidden: true })).toHaveAttribute(
      'href',
      '/profile',
    )
  })
})

describe('Card', () => {
  it('renders its children and applies interactive styling', () => {
    renderWithProviders(
      <Card interactive>
        <div>tarjeta</div>
      </Card>,
    )

    expect(screen.getByText('tarjeta')).toBeInTheDocument()
  })

  it('differs between panel and subtle variants', () => {
    const { unmount } = renderWithProviders(<Card>panel</Card>)
    const panelClass = screen.getByText('panel').className
    unmount()

    renderWithProviders(<Card variant="subtle">subtle</Card>)

    expect(screen.getByText('subtle').className).not.toBe(panelClass)
  })
})

describe('Button', () => {
  it('renders every variant and fires onClick', async () => {
    const onClick = vi.fn()
    renderWithProviders(
      <>
        <PrimaryButton onClick={onClick}>Primario</PrimaryButton>
        <SecondaryButton>Secundario</SecondaryButton>
        <InverseButton>Inverso</InverseButton>
        <GhostButton>Fantasma</GhostButton>
        <OutlineButton>Contorno</OutlineButton>
      </>,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Primario' }))

    expect(onClick).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('button', { name: 'Secundario' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Inverso' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Fantasma' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Contorno' })).toBeInTheDocument()
  })
})

describe('Footer', () => {
  it('renders the brand and links', () => {
    renderWithProviders(
      <Footer
        brand="Mi marca"
        links={[
          { label: 'Términos', to: '/terms' },
          { label: 'Privacidad', to: '/privacy' },
        ]}
      />,
    )

    expect(screen.getByText('Mi marca')).toBeInTheDocument()
    expect(screen.getByText('Términos').closest('a')).toHaveAttribute('href', '/terms')
    expect(screen.getByText('Privacidad').closest('a')).toHaveAttribute('href', '/privacy')
  })
})

describe('typography', () => {
  it('renders the text helpers', () => {
    renderWithProviders(
      <>
        <Muted>muted</Muted>
        <Subtle>subtle</Subtle>
        <Strong>strong</Strong>
        <Price>price</Price>
        <Lead>lead</Lead>
        <Eyebrow>eyebrow</Eyebrow>
        <PageTitle>título</PageTitle>
        <SectionTitle>sección</SectionTitle>
      </>,
    )

    expect(screen.getByText('muted')).toBeInTheDocument()
    expect(screen.getByText('subtle')).toBeInTheDocument()
    expect(screen.getByText('strong')).toBeInTheDocument()
    expect(screen.getByText('price')).toBeInTheDocument()
    expect(screen.getByText('lead')).toBeInTheDocument()
    expect(screen.getByText('eyebrow')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1, name: 'título' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'sección' })).toBeInTheDocument()
  })
})

describe('Logo', () => {
  it('renders the light source in light mode', () => {
    renderWithProviders(<Logo lightSrc="/light.png" darkSrc="/dark.png" height="32px" />)

    expect(screen.getByRole('img', { name: 'UNaHur' })).toHaveAttribute('src', '/light.png')
  })

  it('creates a variant bound to its sources', () => {
    const AppLogo = createLogo('/app-light.png', '/app-dark.png')
    renderWithProviders(<AppLogo height="24px" />)

    expect(screen.getByRole('img', { name: 'UNaHur' })).toHaveAttribute('src', '/app-light.png')
  })
})

describe('BackButton', () => {
  it('renders an accessible back button', async () => {
    renderWithProviders(<BackButton />)

    const button = screen.getByRole('button', { name: 'Volver' })
    expect(button).toBeInTheDocument()

    await userEvent.click(button)
  })
})

describe('FormLayout', () => {
  it('renders its children', () => {
    renderWithProviders(
      <FormLayout>
        <div>campo</div>
      </FormLayout>,
    )

    expect(screen.getByText('campo')).toBeInTheDocument()
  })
})

describe('FormActions', () => {
  it('calls onCancel and shows the submit label', async () => {
    const onCancel = vi.fn()
    renderWithProviders(<FormActions onCancel={onCancel} submitLabel="Guardar" />)

    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }))

    expect(onCancel).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('button', { name: 'Guardar' })).toBeInTheDocument()
  })

  it('disables the submit while submitting', () => {
    renderWithProviders(<FormActions onCancel={vi.fn()} submitLabel="Guardar" isSubmitting />)

    expect(screen.getByText('Guardar').closest('button')).toBeDisabled()
  })

  it('allows a custom cancel label', () => {
    renderWithProviders(
      <FormActions onCancel={vi.fn()} submitLabel="Guardar" cancelLabel="Volver" />,
    )

    expect(screen.getByRole('button', { name: 'Volver' })).toBeInTheDocument()
  })
})

describe('SearchInput', () => {
  it('uses the default placeholder and accepts typing', async () => {
    renderWithProviders(<SearchInput />)

    const input = screen.getByPlaceholderText('Buscar...')
    await userEvent.type(input, 'pizza')

    expect(input).toHaveValue('pizza')
  })

  it('uses a custom placeholder', () => {
    renderWithProviders(<SearchInput placeholder="Buscar productos" />)

    expect(screen.getByPlaceholderText('Buscar productos')).toBeInTheDocument()
  })
})
