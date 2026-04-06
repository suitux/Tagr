import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextResponse } from 'next/server'

const { mockRequireRole, mockPrisma } = vi.hoisted(() => ({
  mockRequireRole: vi.fn(),
  mockPrisma: {
    user: {
      update: vi.fn(),
      delete: vi.fn()
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

import { PATCH, DELETE } from './route'

function unauthorizedResponse() {
  return {
    authorized: false,
    response: NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }
}

function authorizedResponse() {
  return { authorized: true, session: { user: { role: 'admin' } } }
}

function makeParams(id: string) {
  return { params: Promise.resolve({ id }) }
}

function makeRequest(data: Record<string, unknown>) {
  return new Request('http://localhost/api/users/1', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('PATCH /api/users/[id]', () => {
  it('returns 401 when not authenticated', async () => {
    mockRequireRole.mockResolvedValue(unauthorizedResponse())

    const res = await PATCH(makeRequest({ username: 'new' }), makeParams('1'))
    expect(res.status).toBe(401)
  })

  it('returns 400 for invalid id', async () => {
    mockRequireRole.mockResolvedValue(authorizedResponse())

    const res = await PATCH(makeRequest({ username: 'new' }), makeParams('abc'))
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.error).toContain('Invalid user ID')
  })

  it('returns 400 when no fields provided', async () => {
    mockRequireRole.mockResolvedValue(authorizedResponse())

    const res = await PATCH(makeRequest({}), makeParams('1'))
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.error).toContain('No fields to update')
  })

  it('returns 400 when role is admin', async () => {
    mockRequireRole.mockResolvedValue(authorizedResponse())

    const res = await PATCH(makeRequest({ role: 'admin' }), makeParams('1'))
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.error).toContain('tagger or listener')
  })

  it('returns 400 when role is invalid', async () => {
    mockRequireRole.mockResolvedValue(authorizedResponse())

    const res = await PATCH(makeRequest({ role: 'superuser' }), makeParams('1'))
    const body = await res.json()

    expect(res.status).toBe(400)
  })

  it('updates username only', async () => {
    mockRequireRole.mockResolvedValue(authorizedResponse())
    const updated = { id: 1, username: 'renamed', role: 'tagger', createdAt: new Date(), updatedAt: new Date() }
    mockPrisma.user.update.mockResolvedValue(updated)

    const res = await PATCH(makeRequest({ username: 'renamed' }), makeParams('1'))
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.success).toBe(true)
    expect(mockPrisma.user.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { username: 'renamed' },
      select: { id: true, username: true, role: true, createdAt: true, updatedAt: true }
    })
  })

  it('updates password with hash', async () => {
    mockRequireRole.mockResolvedValue(authorizedResponse())
    const updated = { id: 1, username: 'user', role: 'tagger', createdAt: new Date(), updatedAt: new Date() }
    mockPrisma.user.update.mockResolvedValue(updated)

    const res = await PATCH(makeRequest({ password: 'newpass' }), makeParams('1'))

    expect(res.status).toBe(200)
    expect(mockPrisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { password: 'hashed_newpass' } })
    )
  })

  it('updates role only', async () => {
    mockRequireRole.mockResolvedValue(authorizedResponse())
    const updated = { id: 1, username: 'user', role: 'listener', createdAt: new Date(), updatedAt: new Date() }
    mockPrisma.user.update.mockResolvedValue(updated)

    const res = await PATCH(makeRequest({ role: 'listener' }), makeParams('1'))

    expect(res.status).toBe(200)
    expect(mockPrisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { role: 'listener' } })
    )
  })

  it('updates multiple fields at once', async () => {
    mockRequireRole.mockResolvedValue(authorizedResponse())
    const updated = { id: 2, username: 'newname', role: 'listener', createdAt: new Date(), updatedAt: new Date() }
    mockPrisma.user.update.mockResolvedValue(updated)

    const res = await PATCH(
      makeRequest({ username: 'newname', password: 'pw', role: 'listener' }),
      makeParams('2')
    )

    expect(res.status).toBe(200)
    expect(mockPrisma.user.update).toHaveBeenCalledWith({
      where: { id: 2 },
      data: { username: 'newname', password: 'hashed_pw', role: 'listener' },
      select: { id: true, username: true, role: true, createdAt: true, updatedAt: true }
    })
  })

  it('returns 409 on duplicate username', async () => {
    mockRequireRole.mockResolvedValue(authorizedResponse())
    mockPrisma.user.update.mockRejectedValue(new Error('Unique constraint failed on the fields: (`username`)'))

    const res = await PATCH(makeRequest({ username: 'taken' }), makeParams('1'))
    const body = await res.json()

    expect(res.status).toBe(409)
    expect(body.error).toContain('already exists')
  })

  it('returns 500 on unexpected error', async () => {
    mockRequireRole.mockResolvedValue(authorizedResponse())
    mockPrisma.user.update.mockRejectedValue(new Error('Disk full'))

    const res = await PATCH(makeRequest({ username: 'new' }), makeParams('1'))
    const body = await res.json()

    expect(res.status).toBe(500)
    expect(body.error).toBe('Disk full')
  })
})

describe('DELETE /api/users/[id]', () => {
  it('returns 401 when not authenticated', async () => {
    mockRequireRole.mockResolvedValue(unauthorizedResponse())

    const req = new Request('http://localhost/api/users/1', { method: 'DELETE' })
    const res = await DELETE(req, makeParams('1'))
    expect(res.status).toBe(401)
  })

  it('returns 400 for invalid id', async () => {
    mockRequireRole.mockResolvedValue(authorizedResponse())

    const req = new Request('http://localhost/api/users/abc', { method: 'DELETE' })
    const res = await DELETE(req, makeParams('abc'))
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.error).toContain('Invalid user ID')
  })

  it('deletes user and returns success', async () => {
    mockRequireRole.mockResolvedValue(authorizedResponse())
    mockPrisma.user.delete.mockResolvedValue({})

    const req = new Request('http://localhost/api/users/5', { method: 'DELETE' })
    const res = await DELETE(req, makeParams('5'))
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.success).toBe(true)
    expect(mockPrisma.user.delete).toHaveBeenCalledWith({ where: { id: 5 } })
  })

  it('returns 500 on database error', async () => {
    mockRequireRole.mockResolvedValue(authorizedResponse())
    mockPrisma.user.delete.mockRejectedValue(new Error('Record not found'))

    const req = new Request('http://localhost/api/users/99', { method: 'DELETE' })
    const res = await DELETE(req, makeParams('99'))
    const body = await res.json()

    expect(res.status).toBe(500)
    expect(body.error).toBe('Record not found')
  })
})
