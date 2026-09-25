import { createAppConfig } from '@repo/auth'

export const { BRANCH_URL, ADMIN_URL, RIDER_URL, MOCK_AUTH } = createAppConfig({ self: 'admin' })
