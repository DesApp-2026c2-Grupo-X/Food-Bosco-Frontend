export type AuthAppName = 'store' | 'admin' | 'branch' | 'rider'

export interface CreateAppConfigOptions {
  self: AuthAppName
}

interface AuthAppEnv {
  VITE_BRANCH_URL?: string
  VITE_ADMIN_URL?: string
  VITE_RIDER_URL?: string
  VITE_MOCK_AUTH?: string
}

export interface AuthAppConfigUrls {
  BRANCH_URL: string
  ADMIN_URL: string
  RIDER_URL: string
  MOCK_AUTH: boolean
}

const env = (import.meta as unknown as { env?: AuthAppEnv }).env

export const createAppConfig = ({ self }: CreateAppConfigOptions): AuthAppConfigUrls => {
  void self

  return {
    BRANCH_URL: env?.VITE_BRANCH_URL ?? 'http://localhost:5175',
    ADMIN_URL: env?.VITE_ADMIN_URL ?? 'http://localhost:5174',
    RIDER_URL: env?.VITE_RIDER_URL ?? 'http://localhost:5176',
    MOCK_AUTH: env?.VITE_MOCK_AUTH === 'true',
  }
}
