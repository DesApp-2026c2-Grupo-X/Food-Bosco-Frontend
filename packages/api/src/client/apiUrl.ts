const RAW_API_URL =
  (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_API_URL ?? ''

/**
 * Normaliza la base URL del backend para que nunca termine en `/`.
 *
 * Evita rutas con doble slash (`//graphql`, `//v1/uploads`). En Vercel esas
 * rutas responden con un 308 y el preflight CORS falla porque los redirects no
 * están permitidos (rompe el login en la app nativa).
 */
export const normalizeApiUrl = (rawUrl: string) => rawUrl.replace(/\/+$/, '')

export const API_URL = normalizeApiUrl(RAW_API_URL)
