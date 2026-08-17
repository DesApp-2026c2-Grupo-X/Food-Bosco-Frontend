import { gql } from '@apollo/client'
import type { UserRole } from '@repo/domain'

export interface AuthUser {
  id: string
  email: string
  role: UserRole
  firstName: string
  lastName: string
  phone?: string
}

export interface AuthSession {
  accessToken: string
  refreshToken: string
  user: AuthUser
}

export interface RefreshTokenResult {
  refreshToken: {
    accessToken: string
    refreshToken: string
  }
}

export const LOGIN = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      accessToken
      refreshToken
      user {
        id
        email
        role
        firstName
        lastName
        phone
      }
    }
  }
`

export const REGISTER = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      accessToken
      refreshToken
      user {
        id
        email
        role
        firstName
        lastName
        phone
      }
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
