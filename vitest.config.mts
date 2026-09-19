import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

const resolve = (path: string) => fileURLToPath(new URL(path, import.meta.url))

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      { find: '@repo/domain', replacement: resolve('./packages/domain/src/index.ts') },
      { find: '@repo/api', replacement: resolve('./packages/api/src/index.ts') },
      { find: '@repo/components', replacement: resolve('./packages/components/src/index.ts') },
      { find: '@repo/theme', replacement: resolve('./packages/theme/src/index.ts') },
      { find: '@repo/auth', replacement: resolve('./packages/auth/src/index.ts') },
      { find: '@test', replacement: resolve('./test') },
    ],
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: [resolve('./test/setup.ts')],
    include: ['packages/*/src/**/*.{test,spec}.{ts,tsx}', 'apps/*/src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['**/node_modules/**', '**/dist/**'],
    clearMocks: true,
    testTimeout: 15000,
  },
})
