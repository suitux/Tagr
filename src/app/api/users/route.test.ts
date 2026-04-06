import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextResponse } from 'next/server'

const { mockRequireRole, mockPrisma } = vi.hoisted(() => ({
  mockRequireRole: vi.fn(),
  mockPrisma: {
    user: {
      findMany: vi.fn(),
      create: vi.fn()
    }
  }
}))

vi.mock('@/lib/api/auth-guard', () => ({
  requireRole: (...args: unknown[]) => mockRequireRole(...args)
}))

vi.mock('@/infrastructure/prisma/dbClient', () => ({
  prisma: mockPrisma
}))

vi.mock('bcryptjs', () => ({
  default: { hash: vi.fn((pw: string) => `hashed_${pw}`) }
}))

import { GET, POST } from './route'

function unauthorizedResponse() {
  return {
    authorized: false,
    response: NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }
}

function forbiddenResponse() {
  return {
    authorized: false,
    response: NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
  }
}

function authorizedResponse() {
  return { authorized: true, session: { user: { role: 'admin' } } }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('GET /api/users', () => {
  it('returns 401 when not authenticated', async () => {
    mockRequireRole.mockResolvedValue(unauthorizedResponse())

    const res = await GET()
    const body = await res.json()

    expect(res.status).toBe(401)
    expect(body.success).toBe(false)
  })

  it('returns 403 when not admin', async () => {
    mockRequireRole.mockResolvedValue(forbiddenResponse())

    const res = await GET()
    const body = await res.json()

    expect(res.status).toBe(403)
    expect(body.success).toBe(false)
  })

  it('returns users list when authorized', async () => {
    mockRequireRole.mockResolvedValue(authorizedResponse())

    const users = [
      { id: 1, username: 'user1', role: 'tagger', createdAt: new Date(), updatedAt: new Date() },
      { id: 2, username: 'user2', role: 'listener', createdAt: new Date(), updatedAt: new Date() }
    ]
    mockPrisma.user.findMany.mockResolvedValue(users)

    const res = await GET()
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.users).toHaveLength(2)
    expect(mockPrisma.user.findMany).toHaveBeenCalledWith({
      select: { id: true, username: true, role: true, createdAt: true, updatedAt: true },
      orderBy: { createdAt: 'desc' }
    })
  })

  it('returns 500 on database error', async () => {
    mockRequireRole.mockResolvedValue(authorizedResponse())
    mockPrisma.user.findMany.mockRejectedValue(new Error('DB connection failed'))

    const res = await GET()
    const body = await res.json()

    expect(res.status).toBe(500)
    expect(body.success).toBe(false)
    expect(body.error).toBe('DB connection failed')
  })
})

describe('POST /api/users', () => {
  function makeRequest(data: Record<string, unknown>) {
    return new Request('http://localhost/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
  }

  it('returns 401 when not authenticated', async () => {
    mockRequireRole.mockResolvedValue(unauthorizedResponse())

    const res = await POST(makeRequest({ username: 'test', password: 'pass', role: 'tagger' }))
    expect(res.status).toBe(401)
  })

  it('returns 400 when username is missing', async () => {
    mockRequireRole.mockResolvedValue(authorizedResponse())

    const res = await POST(makeRequest({ password: 'pass', role: 'tagger' }))
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.error).toContain('required')
  })

  it('returns 400 when password is missing', async () => {
    mockRequireRole.mockResolvedValue(authorizedResponse())

    const res = await POST(makeRequest({ username: 'test', role: 'tagger' }))
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.error).toContain('required')
  })

  it('returns 400 when role is missing', async () => {
    mockRequireRole.mockResolvedValue(authorizedResponse())

    const res = await POST(makeRequest({ username: 'test', password: 'pass' }))
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.error).toContain('required')
  })

  it('returns 400 when role is admin', async () => {
    mockRequireRole.mockResolvedValue(authorizedResponse())

    const res = await POST(makeRequest({ username: 'test', password: 'pass', role: 'admin' }))
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.error).toContain('tagger or listener')
  })

  it('returns 400 when role is invalid', async () => {
    mockRequireRole.mockResolvedValue(authorizedResponse())

    const res = await POST(makeRequest({ username: 'test', password: 'pass', role: 'superuser' }))
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.error).toContain('tagger or listener')
  })

  it('creates user with hashed password and returns 201', async () => {
    mockRequireRole.mockResolvedValue(authorizedResponse())

    const created = { id: 1, username: 'newuser', role: 'tagger', createdAt: new Date(), updatedAt: new Date() }
    mockPrisma.user.create.mockResolvedValue(created)

    const res = await POST(makeRequest({ username: 'newuser', password: 'secret', role: 'tagger' }))
    const body = await res.json()

    expect(res.status).toBe(201)
    expect(body.success).toBe(true)
    expect(body.user.username).toBe('newuser')
    expect(mockPrisma.user.create).toHaveBeenCalledWith({
      data: { username: 'newuser', password: 'hashed_secret', role: 'tagger' },
      select: { id: true, username: true, role: true, createdAt: true, updatedAt: true }
    })
  })

  it('returns 409 on duplicate username', async () => {
    mockRequireRole.mockResolvedValue(authorizedResponse())
    mockPrisma.user.create.mockRejectedValue(new Error('Unique constraint failed on the fields: (`username`)'))

    const res = await POST(makeRequest({ username: 'existing', password: 'pass', role: 'tagger' }))
    const body = await res.json()

    expect(res.status).toBe(409)
    expect(body.error).toContain('already exists')
  })

  it('returns 500 on unexpected database error', async () => {
    mockRequireRole.mockResolvedValue(authorizedResponse())
    mockPrisma.user.create.mockRejectedValue(new Error('Connection timeout'))

    const res = await POST(makeRequest({ username: 'test', password: 'pass', role: 'tagger' }))
    const body = await res.json()

    expect(res.status).toBe(500)
    expect(body.error).toBe('Connection timeout')
  })
})
