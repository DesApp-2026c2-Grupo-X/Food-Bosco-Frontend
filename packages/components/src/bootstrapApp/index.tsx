import { createRoot } from 'react-dom/client'
import { AppProviders } from '../AppProviders'
import type { BootstrapAppComponent } from './types'

export const bootstrapApp = (App: BootstrapAppComponent) => {
  const container = document.getElementById('root')
  if (!container) {
    throw new Error("No se encontró el elemento '#root' para montar la aplicación")
  }

  createRoot(container).render(
    <AppProviders>
      <App />
    </AppProviders>,
  )
}
