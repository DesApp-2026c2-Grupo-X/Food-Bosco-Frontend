import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['@repo/components', '@repo/api', '@repo/auth', '@repo/domain', '@repo/theme'],
  },
})
