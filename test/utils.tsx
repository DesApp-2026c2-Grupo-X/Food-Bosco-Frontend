import type { ReactElement, ReactNode } from 'react'
import { ChakraProvider, createSystem, defaultConfig } from '@chakra-ui/react'
import { ApolloProvider, type ApolloClient } from '@apollo/client'
import { MemoryRouter } from 'react-router-dom'
import { MockedProvider, type MockedResponse } from '@apollo/client/testing'
import {
  render,
  renderHook,
  type RenderOptions,
  type RenderHookOptions,
} from '@testing-library/react'
import { config } from '@repo/theme'

const system = createSystem(defaultConfig, config)

interface ProvidersOptions {
  route?: string
  apolloMocks?: MockedResponse[]
  client?: ApolloClient<unknown>
}

const buildWrapper = ({ route = '/', apolloMocks, client }: ProvidersOptions) => {
  return ({ children }: { children: ReactNode }) => {
    const inner = <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>

    return (
      <ChakraProvider value={system}>
        {client ? (
          <ApolloProvider client={client}>{inner}</ApolloProvider>
        ) : (
          <MockedProvider mocks={apolloMocks ?? []} addTypename={false}>
            {inner}
          </MockedProvider>
        )}
      </ChakraProvider>
    )
  }
}

export const renderWithProviders = (
  ui: ReactElement,
  options: ProvidersOptions & Omit<RenderOptions, 'wrapper'> = {},
) => {
  const { route, apolloMocks, client, ...renderOptions } = options
  return render(ui, {
    wrapper: buildWrapper({ route, apolloMocks, client }),
    ...renderOptions,
  })
}

export const renderHookWithProviders = <TResult, TProps>(
  hook: (props: TProps) => TResult,
  options: ProvidersOptions & Omit<RenderHookOptions<TProps>, 'wrapper'> = {},
) => {
  const { route, apolloMocks, client, ...hookOptions } = options
  return renderHook(hook, {
    wrapper: buildWrapper({ route, apolloMocks, client }),
    ...hookOptions,
  })
}

export { system }
