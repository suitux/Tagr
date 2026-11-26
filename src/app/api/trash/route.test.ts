import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextResponse } from 'next/server'
import { TrashError } from '@/features/trash/domain'
import { DELETE, GET, POST } from './route'

const { mockRequireRole, mockMoveSongToTrash, mockDeleteSongPermanently, mockRunTrashMaintenance, mockResolve } =
  vi.hoisted(() => ({
    mockRequireRole: vi.fn(),
    mockMoveSongToTrash: vi.fn(),
    mockDeleteSongPermanently: vi.fn(),
    mockRunTrashMaintenance: vi.fn(),
    mockResolve: vi.fn()
  }))

vi.mock('@/lib/api/auth-guard', () => ({
  requireRole: (...args: unknown[]) => mockRequireRole(...args)
}))

vi.mock('@/features/trash/trash.service', () => ({
  moveSongToTrash: (...args: unknown[]) => mockMoveSongToTrash(...args),
  deleteSongPermanently: (...args: unknown[]) => mockDeleteSongPermanently(...args),
  runTrashMaintenance: (...args: unknown[]) => mockRunTrashMaintenance(...args),
  getAllTrashedSongIds: async () => [7, 8]
}))

vi.mock('@/features/metadata/bulk-resolver.service', () => ({
  BulkResolveError: class extends Error {},
  resolveBulkTargetIds: (...args: unknown[]) => mockResolve(...args)
}))

vi.mock('@/features/songs/song-query.repository', () => ({
  PAGE_SIZE: 50,
  getTrashedSongs: async () => [{ id: 1 }],
  countTrashedSongs: async () => 1
}))

function allowEveryRole() {
  mockRequireRole.mockResolvedValue({ authorized: true, session: { user: { id: '3' } } })
}

function forbid() {
  mockRequireRole.mockResolvedValue({
    authorized: false,
    response: NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
  })
}

function request(method: string, body?: unknown) {
  return new Request('http://localhost/api/trash', {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body)
  })
}

async function readEvents(response: Response) {
  const text = await response.text()
  return text
    .split('\n')
    .filter(Boolean)
    .map(line => JSON.parse(line))
}

const idsTarget = (songIds: number[]) => ({ target: { mode: 'ids', songIds } })

beforeEach(() => {
  vi.clearAllMocks()
  mockResolve.mockImplementation(async (target: { songIds: number[] }) => target.songIds)
})

describe('POST /api/trash', () => {
  it('asks for the tagger role and stops when it is missing', async () => {
    forbid()

    const response = await POST(request('POST', idsTarget([1])))

    expect(mockRequireRole).toHaveBeenCalledWith('tagger')
    expect(response.status).toBe(403)
    expect(mockMoveSongToTrash).not.toHaveBeenCalled()
  })

  it('reports each song, with a code and file name for the ones that fail', async () => {
    allowEveryRole()
    mockMoveSongToTrash.mockImplementation(async (id: number) => {
      if (id === 2) throw new TrashError('readOnly', 'read-only', 'b.mp3')
      if (id === 3) throw new Error('boom')
    })

    const events = await readEvents(await POST(request('POST', idsTarget([1, 2, 3]))))

    expect(events.filter(event => event.type === 'result').map(event => event.result)).toEqual([
      { songId: 1, ok: true },
      { songId: 2, ok: false, code: 'readOnly', error: 'read-only', fileName: 'b.mp3' },
      { songId: 3, ok: false, code: 'unknown', error: 'boom' }
    ])
  })

  it('lifts the bulk cap and tidies the trash once every song is handled', async () => {
    allowEveryRole()

    await readEvents(await POST(request('POST', idsTarget([1]))))

    expect(mockResolve).toHaveBeenCalledWith(expect.anything(), { userId: '3', unlimited: true })
    expect(mockRunTrashMaintenance).toHaveBeenCalledTimes(1)
  })

  it('rejects a request without a target', async () => {
    allowEveryRole()

    const response = await POST(request('POST', {}))

    expect(response.status).toBe(400)
    expect(mockMoveSongToTrash).not.toHaveBeenCalled()
  })
})

describe('DELETE /api/trash', () => {
  it('is reserved to admins', async () => {
    forbid()

    const response = await DELETE(request('DELETE', idsTarget([1])))

    expect(mockRequireRole).toHaveBeenCalledWith('admin')
    expect(response.status).toBe(403)
    expect(mockDeleteSongPermanently).not.toHaveBeenCalled()
  })

  it('deletes only the targeted songs', async () => {
    allowEveryRole()

    await readEvents(await DELETE(request('DELETE', idsTarget([4]))))

    expect(mockDeleteSongPermanently.mock.calls.map(call => call[0])).toEqual([4])
  })

  it('empties the whole trash when no target is given', async () => {
    allowEveryRole()

    await readEvents(await DELETE(request('DELETE', {})))

    expect(mockDeleteSongPermanently.mock.calls.map(call => call[0])).toEqual([7, 8])
  })
})

describe('GET /api/trash', () => {
  it('is hidden from listeners', async () => {
    forbid()

    const response = await GET(new Request('http://localhost/api/trash'))

    expect(mockRequireRole).toHaveBeenCalledWith('tagger')
    expect(response.status).toBe(403)
  })

  it('tidies the trash before listing its first page, and only then', async () => {
    allowEveryRole()

    await GET(new Request('http://localhost/api/trash'))
    expect(mockRunTrashMaintenance).toHaveBeenCalledTimes(1)

    await GET(new Request('http://localhost/api/trash?offset=50'))
    expect(mockRunTrashMaintenance).toHaveBeenCalledTimes(1)
  })
})
