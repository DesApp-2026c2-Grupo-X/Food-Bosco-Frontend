export type AppName = 'store' | 'admin' | 'branch' | 'rider'

export const APP_ROLE_MISMATCH_MESSAGE =
  'Tu cuenta no pertenece a esta aplicación. Ingresá desde la app que corresponde a tu rol.'

export interface LoginInput {
  email: string
  password: string
  app: AppName
}

export interface RegisterInput {
  firstName: string
  lastName: string
  email: string
  phone: string
  password: string
  app: AppName
}

export interface RegisterRiderInput {
  firstName: string
  lastName: string
  email: string
  phone: string
  password: string
  vehicle: string
}
