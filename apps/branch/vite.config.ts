import { createAppViteConfig } from '@repo/vite-config'

export default createAppViteConfig({
  port: 5175,
  proxy: {
    '/api': {
      target: 'http://localhost:3000',
      changeOrigin: true,
    },
  },
})
