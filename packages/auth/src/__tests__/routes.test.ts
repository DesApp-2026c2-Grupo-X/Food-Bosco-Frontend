import { describe, expect, it } from 'vitest'
import { authRoutes, resetPasswordPath } from '../routes'

describe('resetPasswordPath', () => {
  it('builds the path from the reset-password route constant', () => {
    expect(resetPasswordPath('tok-123')).toBe(`${authRoutes.resetPassword}?token=tok-123`)
  })

  it('encodes the token with encodeURIComponent', () => {
    const token = 'a b/c?d=e&f#g'

    expect(resetPasswordPath(token)).toBe(
      `${authRoutes.resetPassword}?token=${encodeURIComponent(token)}`,
    )
  })
})
