import { StrictMode } from 'react'
import { ChakraProvider, createSystem, defaultConfig } from '@chakra-ui/react'
import { BrowserRouter } from 'react-router-dom'
import { GraphQLProvider } from '@repo/api'
import { config } from '@repo/theme'
import { ColorModeProvider } from '../ColorModeProvider'
import type { AppProvidersProps } from './types'

const system = createSystem(defaultConfig, config)

export const AppProviders = ({ children }: AppProvidersProps) => (
  <StrictMode>
    <ColorModeProvider defaultTheme="system" enableSystem>
      <ChakraProvider value={system}>
        <GraphQLProvider>
          <BrowserRouter>{children}</BrowserRouter>
        </GraphQLProvider>
      </ChakraProvider>
    </ColorModeProvider>
  </StrictMode>
)
