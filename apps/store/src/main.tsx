import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ChakraProvider } from '@chakra-ui/react'
import { ColorModeProvider } from '@repo/components'
import { App } from './App'
import { system } from './theme'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ColorModeProvider defaultTheme="system" enableSystem>
      <ChakraProvider value={system}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ChakraProvider>
    </ColorModeProvider>
  </StrictMode>,
)
