import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv, type ProxyOptions, type UserConfigExport } from 'vite'

export const DEFAULT_API_URL = 'http://localhost:4000'

export const REPO_OPTIMIZE_DEPS_EXCLUDE = [
  '@repo/components',
  '@repo/api',
  '@repo/auth',
  '@repo/domain',
  '@repo/theme',
]

export interface CreateAppViteConfigOptions {
  port: number
  proxy?: Record<string, ProxyOptions>
}

export function createAppViteConfig({
  port,
  proxy = {},
}: CreateAppViteConfigOptions): UserConfigExport {
  return defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '')
    const apiUrl = env.VITE_API_URL || DEFAULT_API_URL

    return {
      plugins: [react()],
      server: {
        port,
        proxy: {
          '/graphql': {
            target: apiUrl,
            changeOrigin: true,
          },
          '/v1': {
            target: apiUrl,
            changeOrigin: true,
          },
          ...proxy,
        },
      },
      optimizeDeps: {
        exclude: REPO_OPTIMIZE_DEPS_EXCLUDE,
      },
    }
  })
}
