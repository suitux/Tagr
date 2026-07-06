import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { mockReaddir, mockStat, mockParseFile, repo } = vi.hoisted(() => ({
  mockReaddir: vi.fn(),
  mockStat: vi.fn(),
  mockParseFile: vi.fn(),
  repo: {
    createScannedSong: vi.fn(),
    replaceScannedSongByFilePath: vi.fn(),
    findSongByFilePath: vi.fn(),
    findSongById: vi.fn(),
    getSongIdsAndPathsInTree: vi.fn(),
    getSongModifiedTimesInTree: vi.fn(),
    deleteSongById: vi.fn(),
    replaceScannedSongById: vi.fn()
  }
}))

vi.mock('fs/promises', () => ({
  default: { readdir: mockReaddir, stat: mockStat }
}))

vi.mock('music-metadata', () => ({
  parseFile: (...args: unknown[]) => mockParseFile(...args)
}))

vi.mock('@/features/songs/songs.repository', () => repo)

import { scanAllFoldersAndUpdateDatabase } from './metadata-scan.service'

function dirent(name: string) {
  return { name, isDirectory: () => false, isFile: () => true }
}

beforeEach(() => {
  vi.clearAllMocks()
  mockStat.mockResolvedValue({ size: 1, birthtime: new Date(0), mtime: new Date(0) })
  mockParseFile.mockResolvedValue({ common: {}, format: {}, native: {} })
  repo.findSongByFilePath.mockResolvedValue(null)
  repo.createScannedSong.mockResolvedValue(undefined)
  repo.getSongIdsAndPathsInTree.mockResolvedValue([])
})

afterEach(() => {
  delete (globalThis as { gc?: () => void }).gc
})

describe('scanAllFoldersAndUpdateDatabase batching', () => {
  it('scans every file across multiple batches and forces GC once per batch', async () => {
    const fileCount = 250 // 3 batches of 100, 100, 50
    mockReaddir.mockResolvedValue(Array.from({ length: fileCount }, (_, i) => dirent(`song${i}.mp3`)))

    const gc = vi.fn()
    ;(globalThis as { gc?: () => void }).gc = gc

    const result = await scanAllFoldersAndUpdateDatabase(['/music'], undefined, 'full')

    expect(repo.createScannedSong).toHaveBeenCalledTimes(fileCount)
    expect(result.addedFiles).toHaveLength(fileCount)
    // One GC pass per batch: ceil(250 / 100) = 3
    expect(gc).toHaveBeenCalledTimes(3)
  })

  it('is a no-op for GC when --expose-gc is not enabled', async () => {
    mockReaddir.mockResolvedValue([dirent('only.mp3')])

    // No globalThis.gc defined — must not throw.
    const result = await scanAllFoldersAndUpdateDatabase(['/music'], undefined, 'full')

    expect(result.addedFiles).toHaveLength(1)
  })
})
