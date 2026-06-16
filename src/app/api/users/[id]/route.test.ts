import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextResponse } from 'next/server'

const { mockRequireRole, mockUpdateUser, mockDeleteUser } = vi.hoisted(() => ({
  mockRequireRole: vi.fn(),
  mockUpdateUser: vi.fn(),
  mockDeleteUser: vi.fn()
}))

vi.mock('@/lib/api/auth-guard', () => ({
  requireRole: (...args: unknown[]) => mockRequireRole(...args)
}))

vi.mock('@/features/users/users.repository', () => ({
  updateUser: (...args: unknown[]) => mockUpdateUser(...args),
  deleteUser: (...args: unknown[]) => mockDeleteUser(...args)
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
    mockUpdateUser.mockResolvedValue(updated)

    const res = await PATCH(makeRequest({ username: 'renamed' }), makeParams('1'))
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.success).toBe(true)
    expect(mockUpdateUser).toHaveBeenCalledWith(1, { username: 'renamed' })
  })

  it('updates password with hash', async () => {
    mockRequireRole.mockResolvedValue(authorizedResponse())
    const updated = { id: 1, username: 'user', role: 'tagger', createdAt: new Date(), updatedAt: new Date() }
    mockUpdateUser.mockResolvedValue(updated)

    const res = await PATCH(makeRequest({ password: 'newpass' }), makeParams('1'))

    expect(res.status).toBe(200)
    expect(mockUpdateUser).toHaveBeenCalledWith(1, { password: 'hashed_newpass' })
  })

  it('updates role only', async () => {
    mockRequireRole.mockResolvedValue(authorizedResponse())
    const updated = { id: 1, username: 'user', role: 'listener', createdAt: new Date(), updatedAt: new Date() }
    mockUpdateUser.mockResolvedValue(updated)

    const res = await PATCH(makeRequest({ role: 'listener' }), makeParams('1'))

    expect(res.status).toBe(200)
    expect(mockUpdateUser).toHaveBeenCalledWith(1, { role: 'listener' })
  })

  it('updates multiple fields at once', async () => {
    mockRequireRole.mockResolvedValue(authorizedResponse())
    const updated = { id: 2, username: 'newname', role: 'listener', createdAt: new Date(), updatedAt: new Date() }
    mockUpdateUser.mockResolvedValue(updated)

    const res = await PATCH(
      makeRequest({ username: 'newname', password: 'pw', role: 'listener' }),
      makeParams('2')
    )

    expect(res.status).toBe(200)
    expect(mockUpdateUser).toHaveBeenCalledWith(2, {
      username: 'newname',
      password: 'hashed_pw',
      role: 'listener'
    })
  })

  it('returns 409 on duplicate username', async () => {
    mockRequireRole.mockResolvedValue(authorizedResponse())
    mockUpdateUser.mockRejectedValue(new Error('Unique constraint failed on the fields: (`username`)'))

    const res = await PATCH(makeRequest({ username: 'taken' }), makeParams('1'))
    const body = await res.json()

    expect(res.status).toBe(409)
    expect(body.error).toContain('already exists')
  })

  it('returns 500 on unexpected error', async () => {
    mockRequireRole.mockResolvedValue(authorizedResponse())
    mockUpdateUser.mockRejectedValue(new Error('Disk full'))

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
    mockDeleteUser.mockResolvedValue(undefined)

    const req = new Request('http://localhost/api/users/5', { method: 'DELETE' })
    const res = await DELETE(req, makeParams('5'))
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.success).toBe(true)
    expect(mockDeleteUser).toHaveBeenCalledWith(5)
  })

  it('returns 500 on database error', async () => {
    mockRequireRole.mockResolvedValue(authorizedResponse())
    mockDeleteUser.mockRejectedValue(new Error('Record not found'))

    const req = new Request('http://localhost/api/users/99', { method: 'DELETE' })
    const res = await DELETE(req, makeParams('99'))
    const body = await res.json()

    expect(res.status).toBe(500)
    expect(body.error).toBe('Record not found')
  })
})
