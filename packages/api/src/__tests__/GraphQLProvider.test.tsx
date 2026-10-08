import { useApolloClient } from '@apollo/client'
import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { renderWithProviders } from '@test/utils'
import { apolloClient } from '../client/apollo'
import { GraphQLProvider } from '../GraphQLProvider'

let receivedClient: unknown = null

const ClientProbe = () => {
  receivedClient = useApolloClient()
  return <span data-testid="probe-child">ready</span>
}

describe('GraphQLProvider', () => {
  beforeEach(() => {
    receivedClient = null
  })

  it('renders its children', () => {
    renderWithProviders(
      <GraphQLProvider>
        <span data-testid="child">hello</span>
      </GraphQLProvider>,
    )

    expect(screen.getByTestId('child')).toHaveTextContent('hello')
  })

  it('provides the shared apollo client to descendant hooks', () => {
    renderWithProviders(
      <GraphQLProvider>
        <ClientProbe />
      </GraphQLProvider>,
    )

    expect(receivedClient).toBe(apolloClient)
  })
})
