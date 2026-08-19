import { beforeEach, describe, expect, it, vi } from 'vitest'
import { BulkResolveError, resolveBulkTargetIds } from './bulk-resolver.service'

const { mockListListenedSongIds, mockGetSongIdsByFolder } = vi.hoisted(() => ({
  mockListListenedSongIds: vi.fn(),
  mockGetSongIdsByFolder: vi.fn()
}))

vi.mock('@/features/scrobbling/scrobbling.repository', () => ({
  listListenedSongIds: (...args: unknown[]) => mockListListenedSongIds(...args)
}))

vi.mock('@/features/songs/song-query.repository', () => ({
  getSongIdsByFolder: (...args: unknown[]) => mockGetSongIdsByFolder(...args),
  getSongIdsByPlaylist: vi.fn()
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
