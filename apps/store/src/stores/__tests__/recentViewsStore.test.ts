import { beforeEach, describe, expect, it } from 'vitest'
import { useRecentViewsStore } from '../recentViewsStore'

describe('recentViewsStore', () => {
  beforeEach(() => {
    useRecentViewsStore.setState({ viewsByUser: {} })
  })

  it('keeps the most recent view first and avoids duplicates', () => {
    const { trackProductView } = useRecentViewsStore.getState()

    trackProductView('u1', 'p1')
    trackProductView('u1', 'p2')
    trackProductView('u1', 'p1')

    const views = useRecentViewsStore.getState().viewsByUser.u1

    expect(views.map((view) => view.productId)).toEqual(['p1', 'p2'])
  })

  it('separates views by user so recommendations do not leak', () => {
    const { trackProductView } = useRecentViewsStore.getState()

    trackProductView('u1', 'p1')
    trackProductView('u2', 'p2')

    expect(useRecentViewsStore.getState().viewsByUser.u1[0]?.productId).toBe('p1')
    expect(useRecentViewsStore.getState().viewsByUser.u2[0]?.productId).toBe('p2')
  })

  it('caps the history per user', () => {
    const { trackProductView } = useRecentViewsStore.getState()

    for (let index = 0; index < 15; index += 1) {
      trackProductView('u1', `p${index}`)
    }

    const views = useRecentViewsStore.getState().viewsByUser.u1

    expect(views).toHaveLength(12)
    expect(views[0]?.productId).toBe('p14')
  })
})
