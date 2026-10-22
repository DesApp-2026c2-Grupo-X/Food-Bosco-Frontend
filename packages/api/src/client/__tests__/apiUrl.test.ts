import { describe, expect, it } from 'vitest'
import { normalizeApiUrl } from '../apiUrl'

describe('normalizeApiUrl', () => {
  it('keeps an empty value', () => {
    expect(normalizeApiUrl('')).toBe('')
  })

  it('removes a trailing slash', () => {
    expect(normalizeApiUrl('https://food-bosco-api-gateway.vercel.app/')).toBe(
      'https://food-bosco-api-gateway.vercel.app',
    )
  })

  it('removes multiple trailing slashes', () => {
    expect(normalizeApiUrl('https://api.example///')).toBe('https://api.example')
  })

  it('keeps a URL without trailing slash untouched', () => {
    expect(normalizeApiUrl('https://api.example')).toBe('https://api.example')
  })
})
