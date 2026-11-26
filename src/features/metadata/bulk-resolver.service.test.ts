import { beforeEach, describe, expect, it, vi } from 'vitest'
import { BULK_RESOLVE_LIMIT } from '@/features/songs/bulk-target'
import { BulkResolveError, resolveBulkTargetIds } from './bulk-resolver.service'

const { mockListListenedSongIds, mockGetSongIdsByFolder, mockGetTrashedSongIds } = vi.hoisted(() => ({
  mockGetTrashedSongIds: vi.fn(),
  mockListListenedSongIds: vi.fn(),
  mockGetSongIdsByFolder: vi.fn()
}))

vi.mock('@/features/scrobbling/scrobbling.repository', () => ({
  listListenedSongIds: (...args: unknown[]) => mockListListenedSongIds(...args)
}))

vi.mock('@/features/songs/song-query.repository', () => ({
  getSongIdsByFolder: (...args: unknown[]) => mockGetSongIdsByFolder(...args),
  getSongIdsByPlaylist: vi.fn(),
  getTrashedSongIds: (...args: unknown[]) => mockGetTrashedSongIds(...args)
}))

vi.mock('@/features/smart-playlists/smart-playlists.repository', () => ({
  findSmartPlaylistById: vi.fn()
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('resolveBulkTargetIds - recent listens context', () => {
  it('resolves the songs the user has listened to', async () => {
    mockListListenedSongIds.mockResolvedValue([3, 1, 2])

    const ids = await resolveBulkTargetIds(
      { mode: 'all-in-context', context: { type: 'recent-listens' }, search: 'rock' },
      { userId: '7' }
    )

    expect(ids).toEqual([3, 1, 2])
    expect(mockListListenedSongIds).toHaveBeenCalledWith('7', 'rock', undefined, expect.any(Number))
  })

  it('drops the excluded songs', async () => {
    mockListListenedSongIds.mockResolvedValue([1, 2, 3])

    const ids = await resolveBulkTargetIds(
      { mode: 'all-in-context', context: { type: 'recent-listens' }, exclusions: [2] },
      { userId: '7' }
    )

    expect(ids).toEqual([1, 3])
  })

  it('refuses to resolve listens without a user', async () => {
    await expect(
      resolveBulkTargetIds({ mode: 'all-in-context', context: { type: 'recent-listens' } })
    ).rejects.toBeInstanceOf(BulkResolveError)
    expect(mockListListenedSongIds).not.toHaveBeenCalled()
  })
})

describe('resolveBulkTargetIds - trash context', () => {
  it('resolves the songs in the trash, honouring search and exclusions', async () => {
    mockGetTrashedSongIds.mockResolvedValue([4, 5, 6])

    const ids = await resolveBulkTargetIds({
      mode: 'all-in-context',
      context: { type: 'trash' },
      search: 'live',
      exclusions: [5]
    })

    expect(ids).toEqual([4, 6])
    expect(mockGetTrashedSongIds).toHaveBeenCalledWith('live', undefined, BULK_RESOLVE_LIMIT + 1)
  })
})

describe('resolveBulkTargetIds - limit', () => {
  const tooMany = Array.from({ length: BULK_RESOLVE_LIMIT + 1 }, (_, index) => index)

  it('refuses a selection over the limit', async () => {
    mockGetSongIdsByFolder.mockResolvedValue(tooMany)

    await expect(
      resolveBulkTargetIds({ mode: 'all-in-context', context: { type: 'folder', folderPath: '/music' } })
    ).rejects.toBeInstanceOf(BulkResolveError)
    await expect(resolveBulkTargetIds({ mode: 'ids', songIds: tooMany })).rejects.toBeInstanceOf(BulkResolveError)
  })

  it('resolves everything when the caller lifts the limit', async () => {
    mockGetSongIdsByFolder.mockResolvedValue(tooMany)

    const ids = await resolveBulkTargetIds(
      { mode: 'all-in-context', context: { type: 'folder', folderPath: '/music' } },
      { unlimited: true }
    )

    expect(ids).toHaveLength(tooMany.length)
    expect(mockGetSongIdsByFolder).toHaveBeenCalledWith('/music', undefined, undefined, undefined)
    expect(await resolveBulkTargetIds({ mode: 'ids', songIds: tooMany }, { unlimited: true })).toHaveLength(
      tooMany.length
    )
  })
})
