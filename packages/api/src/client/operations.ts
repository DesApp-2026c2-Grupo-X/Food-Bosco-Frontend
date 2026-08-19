import { gql } from '@apollo/client'
import type { Address, User, UserRole } from '@repo/domain'

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface MeUser {
  id: string
  email: string
  firstName: string
  lastName: string
  phone: string | null
  role: string
  active: boolean
  branchId: string | null
  vehicle: string | null
}

export interface ApiAddress {
  id: string
  label: string
  text: string
  city: string | null
  postalCode: string | null
  latitude: number
  longitude: number
  active: boolean
}

export interface LoginResult {
  login: AuthTokens
}

export interface RegisterResult {
  register: AuthTokens
}

export interface RefreshTokenResult {
  refreshToken: AuthTokens
}

export interface MeResult {
  me: MeUser
}

export interface UpdateProfileResult {
  updateProfile: MeUser
}

export interface LogoutResult {
  logout: boolean
}

export interface RequestPasswordRecoveryResult {
  requestPasswordRecovery: boolean
}

export interface ResetPasswordResult {
  resetPassword: boolean
}

export interface MyAddressesResult {
  myAddresses: ApiAddress[]
}

export interface CreateAddressResult {
  createAddress: ApiAddress
}

export interface UpdateAddressResult {
  updateAddress: ApiAddress
}

export interface DeleteAddressResult {
  deleteAddress: boolean
}

const ROLE_FROM_API: Record<string, UserRole> = {
  CUSTOMER: 'customer',
  BRANCH_ADMIN: 'branch_admin',
  SUPER_ADMIN: 'super_admin',
  RIDER: 'rider',
}

export const toUser = (me: MeUser): User => ({
  id: me.id,
  email: me.email,
  role: ROLE_FROM_API[me.role] ?? 'customer',
  firstName: me.firstName,
  lastName: me.lastName,
  phone: me.phone ?? '',
  active: me.active,
  createdAt: new Date().toISOString(),
})

export const toAddress = (address: ApiAddress): Address => ({
  id: address.id,
  label: address.label,
  text: address.text,
  city: address.city,
  postalCode: address.postalCode,
  latitude: address.latitude,
  longitude: address.longitude,
  active: address.active,
})

const USER_FIELDS = `
  id
  email
  firstName
  lastName
  phone
  role
  active
  branchId
  vehicle
`

const ADDRESS_FIELDS = `
  id
  label
  text
  city
  postalCode
  latitude
  longitude
  active
`

export const LOGIN = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      accessToken
      refreshToken
    }
  }
`

export const REGISTER = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      accessToken
      refreshToken
    }
  }
`

export const REFRESH_TOKEN = gql`
  mutation RefreshToken($refreshToken: String!) {
    refreshToken(refreshToken: $refreshToken) {
      accessToken
      refreshToken
    }
  }
`

export const ME = gql`
  query Me {
    me {
      ${USER_FIELDS}
    }
  }
`

export const UPDATE_PROFILE = gql`
  mutation UpdateProfile($input: UpdateProfileInput!) {
    updateProfile(input: $input) {
      ${USER_FIELDS}
    }
  }
`

export const LOGOUT = gql`
  mutation Logout {
    logout
  }
`

export const REQUEST_PASSWORD_RECOVERY = gql`
  mutation RequestPasswordRecovery($email: String!) {
    requestPasswordRecovery(email: $email)
  }
`

export const RESET_PASSWORD = gql`
  mutation ResetPassword($token: String!, $newPassword: String!) {
    resetPassword(token: $token, newPassword: $newPassword)
  }
`

export const MY_ADDRESSES = gql`
  query MyAddresses {
    myAddresses {
      ${ADDRESS_FIELDS}
    }
  }
`

export const CREATE_ADDRESS = gql`
  mutation CreateAddress($input: CreateAddressInput!) {
    createAddress(input: $input) {
      ${ADDRESS_FIELDS}
    }
  }
`

export const UPDATE_ADDRESS = gql`
  mutation UpdateAddress($id: String!, $input: UpdateAddressInput!) {
    updateAddress(id: $id, input: $input) {
      ${ADDRESS_FIELDS}
    }
  }
`

export const DELETE_ADDRESS = gql`
  mutation DeleteAddress($id: String!) {
    deleteAddress(id: $id)
  }
`
