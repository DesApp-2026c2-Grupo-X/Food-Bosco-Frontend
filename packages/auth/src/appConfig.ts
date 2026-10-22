import type { AppName, UserRole } from '@repo/domain'

export type AuthAppName = AppName

export interface CreateAppConfigOptions {
  self: AuthAppName
}

interface AuthAppEnv {
  VITE_BRANCH_URL?: string
  VITE_ADMIN_URL?: string
  VITE_RIDER_URL?: string
  VITE_MOCK_AUTH?: string
}

/**
 * Roles que cada aplicación acepta. Debe mantenerse alineado con
 * `APP_ROLES` del backend (`apps/auth/src/config/constants.ts`).
 */
export const APP_ROLES: Record<AuthAppName, UserRole[]> = {
  store: ['customer'],
  admin: ['super_admin'],
  branch: ['branch_admin'],
  rider: ['rider'],
}

export interface AuthAppConfigUrls {
  APP_NAME: AuthAppName
  ROLES: UserRole[]
  BRANCH_URL: string
  ADMIN_URL: string
  RIDER_URL: string
  MOCK_AUTH: boolean
}

declare global {
  interface ImportMeta {
    readonly env: AuthAppEnv
  }
}

const env = import.meta.env

export const createAppConfig = ({ self }: CreateAppConfigOptions): AuthAppConfigUrls => {
  return {
    APP_NAME: self,
    ROLES: APP_ROLES[self],
    BRANCH_URL: env?.VITE_BRANCH_URL ?? 'http://localhost:5175',
    ADMIN_URL: env?.VITE_ADMIN_URL ?? 'http://localhost:5174',
    RIDER_URL: env?.VITE_RIDER_URL ?? 'http://localhost:5176',
    MOCK_AUTH: env?.VITE_MOCK_AUTH === 'true',
  }
}
