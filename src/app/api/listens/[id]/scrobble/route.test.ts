import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { POST } from './route'

const { mockAuth, mockScrobbleListen } = vi.hoisted(() => ({
  mockAuth: vi.fn(),
  mockScrobbleListen: vi.fn()
}))

vi.mock('@/auth', () => ({
  auth: (...args: unknown[]) => mockAuth(...args)
}))

vi.mock('@/features/scrobbling/scrobbling.service', () => ({
  scrobbleListen: (...args: unknown[]) => mockScrobbleListen(...args)
}))

function postRequest() {
  return new NextRequest('http://localhost/api/listens/42/scrobble', { method: 'POST' })
}

function context(id: string) {
  return { params: Promise.resolve({ id }) }
}

beforeEach(() => {
  vi.clearAllMocks()
  mockAuth.mockResolvedValue({ user: { id: 'admin' } })
  mockScrobbleListen.mockResolvedValue(true)
})

describe('POST /api/listens/[id]/scrobble', () => {
  it('returns 401 when not authenticated', async () => {
    mockAuth.mockResolvedValue(null)

    const res = await POST(postRequest(), context('42'))

    expect(res.status).toBe(401)
    expect(mockScrobbleListen).not.toHaveBeenCalled()
  })

  it('rejects a non numeric listen id', async () => {
    const res = await POST(postRequest(), context('abc'))

    expect(res.status).toBe(400)
    expect(mockScrobbleListen).not.toHaveBeenCalled()
  })

  it('scrobbles the listen for the session user', async () => {
    const res = await POST(postRequest(), context('42'))

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ success: true })
    expect(mockScrobbleListen).toHaveBeenCalledWith('admin', 42)
  })

  it('returns 404 when the listen is not the users', async () => {
    mockScrobbleListen.mockResolvedValue(false)

    const res = await POST(postRequest(), context('42'))

    expect(res.status).toBe(404)
  })
})
