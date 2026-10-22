import { createAppConfig } from '@repo/auth'

export const { APP_NAME, ROLES, BRANCH_URL, ADMIN_URL, RIDER_URL, MOCK_AUTH } = createAppConfig({
  self: 'store',
})
