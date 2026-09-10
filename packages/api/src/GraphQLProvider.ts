import { ApolloProvider } from '@apollo/client'
import { createElement, type ReactNode } from 'react'
import { apolloClient } from './client/apollo'

interface GraphQLProviderProps {
  children: ReactNode
}

export const GraphQLProvider = ({ children }: GraphQLProviderProps) =>
  createElement(ApolloProvider, { client: apolloClient, children })
