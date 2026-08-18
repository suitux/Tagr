import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { GET, POST } from './route'

const { mockAuth, mockRecordListen, mockListRecentListens, mockCountListens } = vi.hoisted(() => ({
  mockAuth: vi.fn(),
  mockRecordListen: vi.fn(),
  mockListRecentListens: vi.fn(),
  mockCountListens: vi.fn()
}))

vi.mock('@/auth', () => ({
  auth: (...args: unknown[]) => mockAuth(...args)
}))

vi.mock('@/features/scrobbling/scrobbling.service', () => ({
  recordListen: (...args: unknown[]) => mockRecordListen(...args)
}))

vi.mock('@/features/scrobbling/scrobbling.repository', () => ({
  listRecentListens: (...args: unknown[]) => mockListRecentListens(...args),
  countListens: (...args: unknown[]) => mockCountListens(...args)
}))

function postRequest(body: unknown) {
  return new NextRequest('http://localhost/api/listens', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' }
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  mockAuth.mockResolvedValue({ user: { id: 'admin' } })
})

describe('POST /api/listens', () => {
  it('returns 401 when not authenticated', async () => {
    mockAuth.mockResolvedValue(null)

    const res = await POST(postRequest({ songId: 1, listenedAt: new Date().toISOString() }))

    expect(res.status).toBe(401)
    expect(mockRecordListen).not.toHaveBeenCalled()
  })

  it('rejects a body without a valid song and date', async () => {
    const res = await POST(postRequest({ songId: 'one', listenedAt: 'never' }))

    expect(res.status).toBe(400)
    expect(mockRecordListen).not.toHaveBeenCalled()
  })

  it('records the listen for the session user', async () => {
    mockRecordListen.mockResolvedValue(42)
    const listenedAt = '2026-08-16T10:00:00.000Z'

    const res = await POST(postRequest({ songId: 7, listenedAt }))
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body).toEqual({ success: true, listenId: 42 })
    expect(mockRecordListen).toHaveBeenCalledWith('admin', 7, new Date(listenedAt))
  })

  it('returns 404 when the song is gone', async () => {
    mockRecordListen.mockResolvedValue(null)

    const res = await POST(postRequest({ songId: 7, listenedAt: new Date().toISOString() }))

    expect(res.status).toBe(404)
  })
})

describe('GET /api/listens', () => {
  it('returns 401 when not authenticated', async () => {
    mockAuth.mockResolvedValue(null)

    const res = await GET(new NextRequest('http://localhost/api/listens'))

    expect(res.status).toBe(401)
  })

  it('returns the recent listens of the session user', async () => {
    mockListRecentListens.mockResolvedValue([{ id: 1 }])
    mockCountListens.mockResolvedValue(1)

    const res = await GET(new NextRequest('http://localhost/api/listens?limit=10&offset=5'))
    const body = await res.json()

    expect(body).toEqual({ success: true, totalListens: 1, listens: [{ id: 1 }] })
    expect(mockListRecentListens).toHaveBeenCalledWith('admin', 10, 5, undefined, undefined, 'desc', undefined)
  })

  it('defaults to the newest 100 listens without search, sort or filters', async () => {
    mockListRecentListens.mockResolvedValue([])
    mockCountListens.mockResolvedValue(0)

    await GET(new NextRequest('http://localhost/api/listens'))

    expect(mockListRecentListens).toHaveBeenCalledWith('admin', 100, 0, undefined, undefined, 'desc', undefined)
    expect(mockCountListens).toHaveBeenCalledWith('admin', undefined, undefined)
  })

  it('forwards search, sorting and column filters to the repository', async () => {
    mockListRecentListens.mockResolvedValue([])
    mockCountListens.mockResolvedValue(0)

    await GET(
      new NextRequest(
        'http://localhost/api/listens?search=daft&sortField=artist&sort=asc&filter.listenedAt=2026-01-01..2026-01-31&filter.genre=House'
      )
    )

    const filters = { listenedAt: '2026-01-01..2026-01-31', genre: 'House' }
    expect(mockListRecentListens).toHaveBeenCalledWith('admin', 100, 0, 'daft', 'artist', 'asc', filters)
    expect(mockCountListens).toHaveBeenCalledWith('admin', 'daft', filters)
  })

  it('caps the page size', async () => {
    mockListRecentListens.mockResolvedValue([])
    mockCountListens.mockResolvedValue(0)

    await GET(new NextRequest('http://localhost/api/listens?limit=100000'))

    expect(mockListRecentListens).toHaveBeenCalledWith('admin', 500, 0, undefined, undefined, 'desc', undefined)
  })
})
