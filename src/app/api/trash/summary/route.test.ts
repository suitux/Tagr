import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GET } from './route'

const { mockRequireRole, mockCountExpired } = vi.hoisted(() => ({
  mockRequireRole: vi.fn(),
  mockCountExpired: vi.fn()
}))

vi.mock('@/lib/api/auth-guard', () => ({
  requireRole: (...args: unknown[]) => mockRequireRole(...args)
}))

vi.mock('@/features/trash/trash.service', () => ({
  getTrashSummary: async () => ({ count: 3, totalSize: 900 }),
  countSongsExpiredUnder: (...args: unknown[]) => mockCountExpired(...args)
}))

beforeEach(() => {
  vi.clearAllMocks()
  mockRequireRole.mockResolvedValue({ authorized: true, session: { user: { id: '1' } } })
  mockCountExpired.mockResolvedValue(2)
})

describe('GET /api/trash/summary', () => {
  it('returns the count and size of the trash', async () => {
    const body = await (await GET(new Request('http://localhost/api/trash/summary'))).json()

    expect(body).toEqual({ success: true, summary: { count: 3, totalSize: 900 } })
    expect(mockCountExpired).not.toHaveBeenCalled()
  })

  it('adds how many songs a given retention would purge', async () => {
    const body = await (await GET(new Request('http://localhost/api/trash/summary?retentionDays=5'))).json()

    expect(body.expired).toBe(2)
    expect(mockCountExpired).toHaveBeenCalledWith(5)
  })

  it('ignores a retention that is not one of the options', async () => {
    const body = await (await GET(new Request('http://localhost/api/trash/summary?retentionDays=7'))).json()

    expect(body).not.toHaveProperty('expired')
    expect(mockCountExpired).not.toHaveBeenCalled()
  })
})
